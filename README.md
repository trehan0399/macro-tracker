# Macro Tracker

A full-stack web application for tracking macronutrients and calories with natural language input via chatbot.

## Features

- **Manual Food Entry**: Add meals with food name, calories, protein, carbs, fat, and date
- **AI-Powered Chatbot**: Natural language food logging using OpenAI and Nutritionix APIs
- **Data Visualization**: Chart.js graphs showing calories and protein over 7 days
- **Maintenance Goals**: Set and track calorie targets
- **Mobile Responsive**: Clean, minimalist UI with Tailwind CSS

## Tech Stack

- **Frontend**: React with Chart.js and Tailwind CSS
- **Backend**: Flask with SQLite database
- **APIs**: OpenAI GPT for natural language processing, Nutritionix for food data

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Create a `.env` file in the backend directory:
```bash
cp env.example .env
```

6. Add your API keys to `.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
NUTRITIONIX_APP_ID=your_nutritionix_app_id_here
NUTRITIONIX_APP_KEY=your_nutritionix_app_key_here
```

7. Initialize the database:
```bash
python init_db.py
```

8. Run the Flask server:
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/logs` - Get all food logs (optional date filter)
- `POST /api/logs` - Add a new food log
- `POST /api/chat` - Process chatbot input and return macros
- `DELETE /api/logs/:id` - Delete a food log
- `GET /api/settings/maintenance-calories` - Get maintenance calorie target
- `POST /api/settings/maintenance-calories` - Update maintenance calorie target
- `GET /api/stats/weekly` - Get weekly nutrition statistics

## Usage

1. **Manual Entry**: Use the form to manually add food items with their nutritional information
2. **Chatbot**: Type natural language descriptions like "I had 2 rotis and chana masala" to automatically log meals
3. **View Progress**: Check the charts to see your calorie and protein intake over the last 7 days
4. **Set Goals**: Enter your maintenance calorie target to see it displayed as a reference line

## Environment Variables

Create a `.env` file in the backend directory with:

```
OPENAI_API_KEY=your_openai_api_key_here
NUTRITIONIX_APP_ID=your_nutritionix_app_id_here
NUTRITIONIX_APP_KEY=your_nutritionix_app_key_here
```

Get your API keys from:
- OpenAI: https://platform.openai.com/api-keys
- Nutritionix: https://www.nutritionix.com/business/api

## Project Structure

```
macrotracker/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── init_db.py            # Database initialization
│   ├── requirements.txt      # Python dependencies
│   ├── env.example          # Environment variables template
│   └── data/                # SQLite database (created on first run)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.js          # Main app component
│   │   └── index.js        # React entry point
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
└── README.md
```

## Features in Detail

### Manual Food Entry
- Form with all required nutrition fields
- Date selection for historical entries
- Validation and error handling
- Success/error feedback

### AI Chatbot
- Natural language processing with OpenAI GPT
- Automatic food item and quantity extraction
- Nutrition data lookup via Nutritionix API
- Detailed breakdown of logged items
- Automatic database storage

### Data Visualization
- Chart.js line charts for weekly overview
- Dual-axis display (calories on left, protein on right)
- Maintenance calorie reference line
- Interactive tooltips and hover effects
- Summary statistics cards

### Food Logs Management
- Chronological display grouped by date
- Daily nutrition totals
- Date filtering capability
- Delete functionality with confirmation
- Mobile-responsive design

### Settings
- Maintenance calorie target management
- App information and tips
- User guidance for better tracking

## Development

The application uses:
- **Flask** for the REST API backend
- **SQLite** for data persistence
- **React** for the frontend UI
- **Chart.js** for data visualization
- **Tailwind CSS** for styling
- **Axios** for API communication
- **OpenAI GPT** for natural language processing
- **Nutritionix API** for food database

## Troubleshooting

1. **Backend won't start**: Make sure you have the correct Python version and all dependencies installed
2. **API errors**: Verify your API keys are correctly set in the `.env` file
3. **Database issues**: Run `python init_db.py` to recreate the database
4. **Frontend won't start**: Ensure Node.js is installed and run `npm install` first
5. **CORS errors**: The backend includes CORS configuration, but ensure both servers are running 