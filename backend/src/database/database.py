import aiosqlite
from pathlib import Path

CURRENT_DIR = Path(__file__).parent
DATABASE_PATH = CURRENT_DIR / "hedgex.db"

async def init_db():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Create users table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Create tables
        await db.execute('''
            CREATE TABLE IF NOT EXISTS stocks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                price REAL,
                change REAL,
                change_percent REAL,
                volume INTEGER,
                sector TEXT,
                high REAL,
                low REAL,
                open REAL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await db.execute('''
            CREATE TABLE IF NOT EXISTS portfolio (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cash REAL NOT NULL,
                total_value REAL NOT NULL,
                daily_change REAL,
                daily_change_percent REAL,
                weekly_change REAL,
                weekly_change_percent REAL,
                monthly_change REAL,
                monthly_change_percent REAL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        await db.execute('''
            CREATE TABLE IF NOT EXISTS portfolio_holdings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stock_id TEXT NOT NULL,
                shares INTEGER NOT NULL,
                avg_cost REAL NOT NULL,
                FOREIGN KEY (stock_id) REFERENCES stocks (symbol)
            )
        ''')

        await db.execute('''
            CREATE TABLE IF NOT EXISTS historical_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stock_symbol TEXT NOT NULL,
                date DATE NOT NULL,
                open REAL NOT NULL,
                high REAL NOT NULL,
                low REAL NOT NULL,
                close REAL NOT NULL,
                volume INTEGER NOT NULL,
                FOREIGN KEY (stock_symbol) REFERENCES stocks (symbol)
            )
        ''')
        
        await db.execute('''
            CREATE TABLE IF NOT EXISTS watchlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        await db.execute('''
            CREATE TABLE IF NOT EXISTS watchlist_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                watchlist_id INTEGER,
                stock_symbol TEXT NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (watchlist_id) REFERENCES watchlists (id),
                FOREIGN KEY (stock_symbol) REFERENCES stocks (symbol)
            )
        ''')
        
        await db.commit()