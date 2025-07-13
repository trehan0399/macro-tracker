from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import openai
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv('OPENAI_API_KEY')

NUTRITIONIX_APP_ID = os.getenv('NUTRITIONIX_APP_ID')
NUTRITIONIX_APP_KEY = os.getenv('NUTRITIONIX_APP_KEY')
NUTRITIONIX_BASE_URL = "https://trackapi.nutritionix.com/v2"

def get_db_connection():
    conn = sqlite3.connect('data/macro_tracker.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        date_filter = request.args.get('date')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if date_filter:
            cursor.execute('''
                SELECT * FROM food_logs 
                WHERE date = ? 
                ORDER BY created_at DESC
            ''', (date_filter,))
        else:
            cursor.execute('''
                SELECT * FROM food_logs 
                ORDER BY created_at DESC
            ''')
        
        logs = cursor.fetchall()
        conn.close()
        
        logs_list = []
        for log in logs:
            logs_list.append({
                'id': log['id'],
                'food_name': log['food_name'],
                'calories': log['calories'],
                'protein': log['protein'],
                'date': log['date'],
                'created_at': log['created_at']
            })
        
        return jsonify(logs_list)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs', methods=['POST'])
def add_log():
    try:
        data = request.get_json()
        
        required_fields = ['food_name', 'calories', 'protein', 'date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO food_logs (food_name, calories, protein, date, created_at)
            VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
        ''', (
            data['food_name'],
            data['calories'],
            data['protein'],
            data['date']
        ))
        
        log_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({'id': log_id, 'message': 'Food log added successfully'}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs/<int:log_id>', methods=['DELETE'])
def delete_log(log_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM food_logs WHERE id = ?', (log_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Log not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Food log deleted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logs', methods=['DELETE'])
def clear_all_logs():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM food_logs')
        deleted_count = cursor.rowcount
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': f'All {deleted_count} food logs deleted successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def process_chat():
    try:
        data = request.get_json()
        user_input = data.get('message', '').strip()
        if not user_input:
            return jsonify({'error': 'Message is required'}), 400
        food_items = extract_food_items(user_input)
        if not food_items:
            clarification_prompt = f"""
            The user said: "{user_input}"
            This input seems vague or unclear. Please suggest what specific food items they might be referring to.
            Return a JSON object with 'needs_clarification' set to true and 'suggestions' as an array of possible foods.
            Example:
            {{"needs_clarification": true, "suggestions": ["chicken breast", "rice", "vegetables"]}}
            """
            
            try:
                client = openai.OpenAI()
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a helpful nutrition assistant. Help clarify vague food inputs."},
                        {"role": "user", "content": clarification_prompt}
                    ],
                    max_tokens=150,
                    temperature=0.1
                )
                
                content = response.choices[0].message.content.strip()
                if content.startswith('```json'):
                    content = content[7:]
                if content.endswith('```'):
                    content = content[:-3]
                
                clarification = json.loads(content)
                if 'needs_clarification' in clarification:
                    clarification['needs_clarification'] = bool(clarification['needs_clarification'])
                return jsonify(clarification)
                
            except Exception as e:
                return jsonify({'error': 'Could not understand your input. Please be more specific about what you ate.'}), 400
        
        total_calories = 0
        total_protein = 0
        food_details = []
        
        for item in food_items:
            measurement = item.get('measurement')
            nutrition_data = get_nutrition_data(item['food'], item['quantity'], measurement)
            if nutrition_data:
                total_calories += nutrition_data['calories']
                total_protein += nutrition_data['protein']
                food_details.append({
                    'food': item['food'],
                    'quantity': item['quantity'],
                    'measurement': nutrition_data.get('measurement', ''),
                    'calories': nutrition_data['calories'],
                    'protein': nutrition_data['protein']
                })
        
        today = datetime.now().strftime('%Y-%m-%d')
        conn = get_db_connection()
        cursor = conn.cursor()
        
        for detail in food_details:
            food_name = f"{detail['measurement']} {detail['food']}" if detail['measurement'] else f"{detail['quantity']} {detail['food']}"
            cursor.execute('''
                INSERT INTO food_logs (food_name, calories, protein, date, created_at)
                VALUES (?, ?, ?, ?, datetime('now', 'localtime'))
            ''', (
                food_name,
                detail['calories'],
                detail['protein'],
                today
            ))
        
        conn.commit()
        conn.close()
        
        summary = f"{total_calories:.0f} calories, {total_protein:.1f}g protein"
        
        response_data = {
            'summary': summary,
            'details': food_details,
            'totals': {
                'calories': total_calories,
                'protein': total_protein
            }
        }
        
        return jsonify(response_data)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def extract_food_items(user_input):
    try:
        prompt = f"""
        Extract food items and their quantities from this text: "{user_input}"
        
        Handle common measurements and vague descriptions:
        - "hand-sized" = 3-4 oz (85-113g) for meat/fish
        - "palm-sized" = 3 oz (85g) for meat/fish  
        - "fist-sized" = 1 cup (240ml) for rice/pasta
        - "thumb-sized" = 1 tbsp (15ml) for butter/oil
        - "deck of cards" = 3 oz (85g) for meat
        - "tennis ball" = 1 cup (240ml) for fruits/vegetables
        - "baseball" = 1 cup (240ml) for fruits/vegetables
        - "golf ball" = 2 tbsp (30ml) for nuts/seeds
        
        For vague items like "some chicken" or "a bit of rice", use reasonable defaults:
        - "some chicken" = 4 oz (113g)
        - "a bit of rice" = 1/2 cup (120ml)
        - "some vegetables" = 1 cup (240ml)
        
        Return a JSON array of objects with 'food', 'quantity', and 'measurement' fields.
        For quantities, use the estimated amount in grams or ml.
        For measurements, include the original description.
        
        Example output:
        [
            {{"food": "chicken thigh", "quantity": 113, "measurement": "hand-sized"}},
            {{"food": "rice", "quantity": 120, "measurement": "1/2 cup"}}
        ]
        
        Only return the JSON array, nothing else.
        """
        
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that extracts food items and quantities from text. Handle vague descriptions and common measurements. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.1
        )
        
        content = response.choices[0].message.content.strip()
        if content.startswith('```json'):
            content = content[7:]
        if content.endswith('```'):
            content = content[:-3]
        
        food_items = json.loads(content)
        return food_items
    
    except Exception as e:
        return []

def get_nutrition_data(food_name, quantity, measurement=None):
    try:
        headers = {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_APP_KEY,
            'x-remote-user-id': '0',
            'Content-Type': 'application/json'
        }
        
        search_url = f"{NUTRITIONIX_BASE_URL}/search/instant"
        search_params = {
            'query': food_name,
            'detailed': True
        }
        
        response = requests.get(search_url, headers=headers, params=search_params)
        response.raise_for_status()
        
        results = response.json()
        
        if not results.get('common') and not results.get('branded'):
            return None
        
        food_item = results.get('common', [])[0] if results.get('common') else results.get('branded', [])[0]
        
        if measurement:
            query = f"{measurement} {food_name}"
        else:
            if quantity >= 100:
                query = f"{quantity}g {food_name}"
            else:
                query = f"{quantity} {food_name}"
        
        nutrition_url = f"{NUTRITIONIX_BASE_URL}/natural/nutrients"
        nutrition_data = {
            'query': query
        }
        
        response = requests.post(nutrition_url, headers=headers, json=nutrition_data)
        response.raise_for_status()
        
        nutrition_results = response.json()
        
        if not nutrition_results.get('foods'):
            return None
        
        food_nutrition = nutrition_results['foods'][0]
        
        return {
            'calories': food_nutrition.get('nf_calories', 0),
            'protein': food_nutrition.get('nf_protein', 0),
            'measurement': measurement or f"{quantity}g"
        }
    
    except Exception as e:
        return None

@app.route('/api/settings/maintenance-calories', methods=['GET'])
def get_maintenance_calories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT maintenance_calories FROM settings WHERE id = 1')
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return jsonify({'maintenance_calories': result['maintenance_calories']})
        else:
            return jsonify({'maintenance_calories': 2000})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/settings/maintenance-calories', methods=['POST'])
def update_maintenance_calories():
    try:
        data = request.get_json()
        calories = data.get('maintenance_calories')
        
        if not calories or not isinstance(calories, int):
            return jsonify({'error': 'Valid maintenance_calories integer is required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE settings 
            SET maintenance_calories = ?, updated_at = datetime('now', 'localtime')
            WHERE id = 1
        ''', (calories,))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Maintenance calories updated successfully'})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats/weekly', methods=['GET'])
def get_weekly_stats():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        end_date = datetime.now()
        start_date = end_date - timedelta(days=6)
        
        cursor.execute('''
            SELECT date, SUM(calories) as total_calories, SUM(protein) as total_protein
            FROM food_logs 
            WHERE date BETWEEN ? AND ?
            GROUP BY date
            ORDER BY date
        ''', (start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')))
        
        results = cursor.fetchall()
        conn.close()
        
        stats = []
        current_date = start_date
        
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            day_data = next((row for row in results if row['date'] == date_str), None)
            
            if day_data:
                stats.append({
                    'date': date_str,
                    'calories': day_data['total_calories'],
                    'protein': day_data['total_protein']
                })
            else:
                stats.append({
                    'date': date_str,
                    'calories': 0,
                    'protein': 0
                })
            
            current_date += timedelta(days=1)
        
        return jsonify(stats)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    import init_db
    init_db.init_db()
    app.run(debug=True) 