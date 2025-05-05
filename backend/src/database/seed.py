import aiosqlite
import asyncio
import bcrypt
from datetime import datetime, timedelta
from .database import DATABASE_PATH, init_db

async def seed_database():
    # Initialize database first
    await init_db()
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Seed demo user
        demo_password = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt())
        await db.execute('''
            INSERT OR REPLACE INTO users (name, email, password)
            VALUES (?, ?, ?)
        ''', ('Demo User', 'demo@example.com', demo_password.decode('utf-8')))

        # Seed stocks table
        stocks_data = [
            ('AAPL', 'Apple Inc.', 174.23, 1.25, 0.72, 48956321, 'Technology', 175.10, 173.05, 173.50),
            ('MSFT', 'Microsoft Corporation', 328.79, 2.56, 0.78, 21542632, 'Technology', 330.15, 326.90, 327.20),
            ('AMZN', 'Amazon.com Inc.', 132.85, -0.92, -0.69, 32145698, 'Consumer Cyclical', 133.95, 132.10, 133.75),
            ('GOOGL', 'Alphabet Inc.', 143.96, 1.05, 0.73, 18745632, 'Communication Services', 144.50, 142.80, 143.20),
            ('TSLA', 'Tesla, Inc.', 175.34, -3.21, -1.83, 52365412, 'Consumer Cyclical', 178.90, 174.30, 178.50),
            ('META', 'Meta Platforms, Inc.', 472.42, 5.68, 1.21, 15236547, 'Communication Services', 474.80, 468.90, 469.10),
            ('NVDA', 'NVIDIA Corporation', 824.12, 12.34, 1.52, 28563214, 'Technology', 830.56, 815.20, 817.85),
        ]
        await db.executemany('''
            INSERT OR REPLACE INTO stocks 
            (symbol, name, price, change, change_percent, volume, sector, high, low, open)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', stocks_data)

        # Seed portfolio data
        await db.execute('''
            INSERT INTO portfolio 
            (cash, total_value, daily_change, daily_change_percent, 
             weekly_change, weekly_change_percent, monthly_change, monthly_change_percent)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (25000.00, 163524.87, 1432.56, 0.88, 3256.78, 2.03, 6789.12, 4.32))

        # Seed portfolio holdings
        holdings_data = [
            ('AAPL', 50, 165.42),
            ('MSFT', 20, 320.15),
            ('GOOGL', 30, 138.75),
            ('META', 15, 450.20),
            ('NVDA', 10, 750.30),
        ]
        await db.executemany('''
            INSERT INTO portfolio_holdings (stock_id, shares, avg_cost)
            VALUES (?, ?, ?)
        ''', holdings_data)

        # Seed historical data
        for symbol, _, base_price, *_ in stocks_data:
            dates = [(datetime.now() - timedelta(days=x)).date() for x in range(365, -1, -1)]
            price = base_price
            historical_data = []
            
            for date in dates:
                # Simulate some price movement
                change = (hash(str(date) + symbol) % 200 - 100) / 1000 * price
                price = max(0.1, price + change)
                volume = hash(str(date) + symbol + 'vol') % 10000000 + 1000000
                
                historical_data.append((
                    symbol,
                    date,
                    price * 0.99,  # open
                    price * 1.02,  # high
                    price * 0.98,  # low
                    price,         # close
                    volume
                ))
            
            await db.executemany('''
                INSERT OR REPLACE INTO historical_data 
                (stock_symbol, date, open, high, low, close, volume)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', historical_data)

        await db.commit()

if __name__ == '__main__':
    asyncio.run(seed_database())