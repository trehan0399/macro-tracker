import sqlite3
import os
from datetime import datetime

def init_db():
    """Initialize the SQLite database with the required tables."""
    
    # Create database directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Connect to SQLite database (creates it if it doesn't exist)
    conn = sqlite3.connect('data/macro_tracker.db')
    cursor = conn.cursor()
    
    # Create food_logs table with local timestamp
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS food_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            food_name TEXT NOT NULL,
            calories REAL NOT NULL,
            protein REAL NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now', 'localtime'))
        )
    ''')
    
    # Create settings table for maintenance calories
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            maintenance_calories INTEGER DEFAULT 2000,
            updated_at TEXT DEFAULT (datetime('now', 'localtime'))
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