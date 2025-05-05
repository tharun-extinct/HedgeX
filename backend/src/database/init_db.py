import aiosqlite
import asyncio
import bcrypt
import json
from datetime import datetime, timedelta
from pathlib import Path

# Import from the local database module
from src.database.database import DATABASE_PATH

# Sample data for initialization
SAMPLE_STOCKS = [
    { 
        "symbol": "AAPL", 
        "name": "Apple Inc.", 
        "price": 174.23, 
        "change": 1.25, 
        "change_percent": 0.72, 
        "volume": 48956321, 
        "sector": "Technology",
        "high": 175.10,
        "low": 173.05,
        "open": 173.50
    },
    { 
        "symbol": "MSFT", 
        "name": "Microsoft Corporation", 
        "price": 328.79, 
        "change": 2.56, 
        "change_percent": 0.78, 
        "volume": 21542632, 
        "sector": "Technology",
        "high": 330.15,
        "low": 326.90,
        "open": 327.20
    },
    { 
        "symbol": "GOOGL", 
        "name": "Alphabet Inc.", 
        "price": 138.45, 
        "change": -0.75, 
        "change_percent": -0.54, 
        "volume": 15678932, 
        "sector": "Technology",
        "high": 139.20,
        "low": 137.80,
        "open": 138.90
    },
    { 
        "symbol": "AMZN", 
        "name": "Amazon.com Inc.", 
        "price": 145.68, 
        "change": 1.32, 
        "change_percent": 0.91, 
        "volume": 32456789, 
        "sector": "Consumer Cyclical",
        "high": 146.50,
        "low": 144.75,
        "open": 145.10
    },
    { 
        "symbol": "TSLA", 
        "name": "Tesla Inc.", 
        "price": 248.50, 
        "change": -3.25, 
        "change_percent": -1.29, 
        "volume": 28765432, 
        "sector": "Consumer Cyclical",
        "high": 252.30,
        "low": 247.80,
        "open": 251.75
    },
    { 
        "symbol": "JPM", 
        "name": "JPMorgan Chase & Co.", 
        "price": 152.34, 
        "change": 0.87, 
        "change_percent": 0.57, 
        "volume": 12345678, 
        "sector": "Financial Services",
        "high": 153.20,
        "low": 151.60,
        "open": 151.80
    },
    { 
        "symbol": "JNJ", 
        "name": "Johnson & Johnson", 
        "price": 165.78, 
        "change": 0.45, 
        "change_percent": 0.27, 
        "volume": 8765432, 
        "sector": "Healthcare",
        "high": 166.30,
        "low": 165.20,
        "open": 165.50
    },
    { 
        "symbol": "V", 
        "name": "Visa Inc.", 
        "price": 245.67, 
        "change": 1.23, 
        "change_percent": 0.50, 
        "volume": 9876543, 
        "sector": "Financial Services",
        "high": 246.50,
        "low": 244.80,
        "open": 245.10
    }
]

SAMPLE_PORTFOLIO = {
    "cash": 25000.00,
    "total_value": 163524.87,
    "daily_change": 1432.56,
    "daily_change_percent": 0.88,
    "weekly_change": 3256.78,
    "weekly_change_percent": 2.03,
    "monthly_change": 6789.12,
    "monthly_change_percent": 4.32,
    "holdings": [
        { "stock_id": "AAPL", "shares": 50, "avg_cost": 165.42 },
        { "stock_id": "MSFT", "shares": 20, "avg_cost": 320.15 },
        { "stock_id": "GOOGL", "shares": 15, "avg_cost": 135.20 },
        { "stock_id": "AMZN", "shares": 10, "avg_cost": 142.75 }
    ]
}

SAMPLE_WATCHLISTS = [
    {
        "name": "Tech Giants",
        "stocks": ["AAPL", "MSFT", "GOOGL"]
    },
    {
        "name": "E-Commerce",
        "stocks": ["AMZN", "BABA"]
    },
    {
        "name": "Financial",
        "stocks": ["JPM", "V"]
    }
]

SAMPLE_USERS = [
    {
        "name": "Demo User",
        "email": "demo@example.com",
        "password": "password123"
    }
]

# Generate historical data for a stock
def generate_historical_data(symbol, days=180):
    data = []
    base_price = next((s["price"] for s in SAMPLE_STOCKS if s["symbol"] == symbol), 100)
    volatility = 0.02  # 2% volatility
    
    current_price = base_price
    now = datetime.now()
    
    for i in range(days, -1, -1):
        date = now - timedelta(days=i)
        # Random price movement with trend
        change = (0.5 - (i / days)) * volatility * current_price
        current_price = max(0.1, current_price + change)
        
        # Add some noise to volume
        volume = int((0.5 + (i / days)) * 10000000) + 1000000
        
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "open": current_price * (1 - 0.005),
            "high": current_price * (1 + 0.01),
            "low": current_price * (1 - 0.01),
            "close": current_price,
            "volume": volume
        })
    
    return data

async def init_sample_data():
    # Create database tables
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Insert sample users
        for user in SAMPLE_USERS:
            # Check if user already exists
            cursor = await db.execute('SELECT * FROM users WHERE email = ?', (user["email"],))
            if await cursor.fetchone() is None:
                # Hash the password
                hashed = bcrypt.hashpw(user["password"].encode('utf-8'), bcrypt.gensalt())
                await db.execute(
                    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                    (user["name"], user["email"], hashed.decode('utf-8'))
                )
        
        # Insert sample stocks
        for stock in SAMPLE_STOCKS:
            # Check if stock already exists
            cursor = await db.execute('SELECT * FROM stocks WHERE symbol = ?', (stock["symbol"],))
            if await cursor.fetchone() is None:
                await db.execute('''
                    INSERT INTO stocks 
                    (symbol, name, price, change, change_percent, volume, sector, high, low, open)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    stock["symbol"], stock["name"], stock["price"], 
                    stock["change"], stock["change_percent"], stock["volume"],
                    stock["sector"], stock["high"], stock["low"], stock["open"]
                ))
        
        # Insert sample portfolio
        cursor = await db.execute('SELECT COUNT(*) FROM portfolio')
        count = await cursor.fetchone()
        if count[0] == 0:
            await db.execute('''
                INSERT INTO portfolio 
                (cash, total_value, daily_change, daily_change_percent, 
                weekly_change, weekly_change_percent, monthly_change, monthly_change_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                SAMPLE_PORTFOLIO["cash"], SAMPLE_PORTFOLIO["total_value"],
                SAMPLE_PORTFOLIO["daily_change"], SAMPLE_PORTFOLIO["daily_change_percent"],
                SAMPLE_PORTFOLIO["weekly_change"], SAMPLE_PORTFOLIO["weekly_change_percent"],
                SAMPLE_PORTFOLIO["monthly_change"], SAMPLE_PORTFOLIO["monthly_change_percent"]
            ))
            
            # Insert portfolio holdings
            for holding in SAMPLE_PORTFOLIO["holdings"]:
                await db.execute('''
                    INSERT INTO portfolio_holdings (stock_id, shares, avg_cost)
                    VALUES (?, ?, ?)
                ''', (holding["stock_id"], holding["shares"], holding["avg_cost"]))
        
        # Insert sample watchlists
        for watchlist in SAMPLE_WATCHLISTS:
            # Check if watchlist already exists
            cursor = await db.execute('SELECT * FROM watchlists WHERE name = ?', (watchlist["name"],))
            existing_watchlist = await cursor.fetchone()
            
            if existing_watchlist is None:
                await db.execute('INSERT INTO watchlists (name) VALUES (?)', (watchlist["name"],))
                cursor = await db.execute('SELECT id FROM watchlists WHERE name = ?', (watchlist["name"],))
                watchlist_id = (await cursor.fetchone())[0]
                
                # Add stocks to watchlist
                for symbol in watchlist["stocks"]:
                    await db.execute(
                        'INSERT INTO watchlist_items (watchlist_id, stock_symbol) VALUES (?, ?)',
                        (watchlist_id, symbol)
                    )
        
        # Insert historical data for each stock
        for stock in SAMPLE_STOCKS:
            symbol = stock["symbol"]
            # Check if historical data already exists for this stock
            cursor = await db.execute('SELECT COUNT(*) FROM historical_data WHERE stock_symbol = ?', (symbol,))
            count = await cursor.fetchone()
            
            if count[0] == 0:  # Only insert if no data exists
                historical_data = generate_historical_data(symbol)
                for data_point in historical_data:
                    await db.execute('''
                        INSERT INTO historical_data 
                        (stock_symbol, date, open, high, low, close, volume)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        symbol, data_point["date"], data_point["open"], 
                        data_point["high"], data_point["low"], data_point["close"], 
                        data_point["volume"]
                    ))
        
        await db.commit()
        print("Sample data initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_sample_data())