# Macro Tracker

## Project Status
## 🚧 Work in Progres

**This project is currently a work in progress and is not yet finished or deployed. Some features may be incomplete or subject to change.**

## 🚀 Tech Stack & Functionality

**Full-Stack Web Application** built with modern technologies:

### Frontend
- **React.js** - Interactive user interface with component-based architecture
- **Chart.js** - Data visualization and analytics dashboard
- **Tailwind CSS** - Responsive, mobile-first design system
- **Axios** - HTTP client for API communication

### Backend
- **Flask** - Python web framework for RESTful API development
- **SQLite** - Lightweight database for data persistence
- **SQLAlchemy** - Database ORM and query management

### AI & External APIs
- **OpenAI GPT** - Natural language processing for food input
- **Nutritionix API** - Comprehensive food database integration

## About This Project

I built this macro tracker to solve a personal problem I faced while tracking my nutrition. Most existing apps are cluttered, locked behind paywalls for basic features like photo logging or chatbots, and require tedious manual entry of every ingredient. This becomes especially frustrating when you're eating something without a nutrition label, making tracking feel like more work than it’s worth. As a result, I often found myself giving up on my weight loss journey altogether.

This project brings together my passion for fitness, my personal goal of losing weight, and my drive to build practical, user-friendly tools. I was especially excited to implement the AI chatbot, which allows users to simply type something like “I had 2 rotis and chana masala,” then automatically pulls the nutritional information and logs it. By removing friction and simplifying the process, this tool makes healthy eating more sustainable and aims to help others overcome the same challenges I faced in tracking macros and building a healthier lifestyle.

## Future Plans

I plan to deploy this application to the cloud (likely on platforms like Vercel, Railway, or Render) once the development phase is complete. The goal is to make it publicly accessible so others can benefit from the simplified nutrition tracking experience.

## 🔑 Key Features

- **Manual Food Entry**: Add meals with food name, calories, protein, and date (carbs and fats will be added soon. For now, I’m focusing on calories and protein, which I personally prioritize for weight loss.)
- **AI-Powered Chatbot**: Natural language food logging using OpenAI and Nutritionix APIs
- **Data Visualization**: Chart.js graphs showing calories and protein over 7 days
- **Maintenance Goals**: Set and track calorie targets
- **Mobile Responsive**: Clean, minimalist UI with Tailwind CSS

## 🛠️ Setup Instructions (For Early Users & Local Testing)

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