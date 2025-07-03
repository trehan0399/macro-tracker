import sqlite3
import os

def init_db():
    """Initialize the SQLite database with the required tables."""
    
    # Create database directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect('data/macro_tracker.db')
    cursor = conn.cursor()
    
    # Create food_logs table with only calories and protein
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS food_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            food_name TEXT NOT NULL,
            calories REAL NOT NULL,
            protein REAL NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create settings table for maintenance calories
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            maintenance_calories INTEGER DEFAULT 2000,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert default maintenance calories if not exists
    cursor.execute('''
        INSERT OR IGNORE INTO settings (id, maintenance_calories) 
        VALUES (1, 2000)
    ''')
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print("Database initialized successfully!")
    print("Tables created: food_logs (calories, protein only), settings")

if __name__ == '__main__':
    init_db() 