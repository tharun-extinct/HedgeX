from quart import Blueprint, jsonify, request
import aiosqlite
from datetime import datetime, timedelta
import jwt
import bcrypt
from src.database.database import DATABASE_PATH

bp = Blueprint('api', __name__)

SECRET_KEY = "your-secret-key-here"  # In production, this should be in environment variables

# Auth middleware
async def auth_required(request):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Unauthorized"}), 401
    
    token = auth_header.split(' ')[1]
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

# Auth routes
@bp.route('/auth/register', methods=['POST'])
async def register():
    data = await request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([name, email, password]):
        return jsonify({"error": "All fields are required"}), 400
    
    # Hash the password
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Check if user already exists
        cursor = await db.execute('SELECT * FROM users WHERE email = ?', (email,))
        if await cursor.fetchone():
            return jsonify({"error": "Email already registered"}), 409
        
        # Create new user
        await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            (name, email, hashed.decode('utf-8'))
        )
        await db.commit()
        
        # Generate token
        token = jwt.encode(
            {'email': email, 'name': name},
            SECRET_KEY,
            algorithm='HS256'
        )
        
        return jsonify({
            "token": token,
            "user": {"email": email, "name": name}
        }), 201

@bp.route('/auth/login', methods=['POST'])
async def login():
    data = await request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = await cursor.fetchone()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
            token = jwt.encode(
                {'email': user['email'], 'name': user['name']},
                SECRET_KEY,
                algorithm='HS256'
            )
            return jsonify({
                "token": token,
                "user": {"email": user['email'], "name": user['name']}
            })
        
        return jsonify({"error": "Invalid email or password"}), 401

@bp.route('/auth/verify', methods=['GET'])
async def verify_token():
    user_data = await auth_required(request)
    if isinstance(user_data, tuple):  # Error response
        return user_data
    
    return jsonify({"valid": True}), 200

# Protected routes
@bp.route('/portfolio', methods=['GET'])
async def get_portfolio():
    user_data = await auth_required(request)
    if isinstance(user_data, tuple):  # Error response
        return user_data
        
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('SELECT * FROM portfolio ORDER BY id DESC LIMIT 1')
        portfolio = await cursor.fetchone()
        
        if not portfolio:
            return jsonify(None)
        
        cursor = await db.execute('''
            SELECT ph.*, s.symbol, s.price 
            FROM portfolio_holdings ph
            JOIN stocks s ON ph.stock_id = s.symbol
        ''')
        holdings = await cursor.fetchall()
        
        result = dict(portfolio)
        result['holdings'] = [dict(holding) for holding in holdings]
        return jsonify(result)

@bp.route('/portfolio/latest', methods=['GET'])
async def get_latest_portfolio():
    user_data = await auth_required(request)
    if isinstance(user_data, tuple):
        return user_data
        
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT * FROM portfolio 
            WHERE updated_at > ? 
            ORDER BY id DESC LIMIT 1
        ''', (datetime.now() - timedelta(minutes=5),))
        portfolio = await cursor.fetchone()
        
        if not portfolio:
            return jsonify(None)
            
        cursor = await db.execute('''
            SELECT ph.*, s.symbol, s.price 
            FROM portfolio_holdings ph
            JOIN stocks s ON ph.stock_id = s.symbol
        ''')
        holdings = await cursor.fetchall()
        
        result = dict(portfolio)
        result['holdings'] = [dict(holding) for holding in holdings]
        return jsonify(result)

@bp.route('/portfolio/allocation', methods=['GET'])
async def get_portfolio_allocation():
    user_data = await auth_required(request)
    if isinstance(user_data, tuple):
        return user_data
        
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT 
                s.sector,
                SUM(ph.shares * s.price) as value
            FROM portfolio_holdings ph
            JOIN stocks s ON ph.stock_id = s.symbol
            GROUP BY s.sector
        ''')
        allocations = await cursor.fetchall()
        
        total_value = sum(alloc['value'] for alloc in allocations)
        
        result = []
        for alloc in allocations:
            data = dict(alloc)
            data['percentage'] = (data['value'] / total_value * 100) if total_value > 0 else 0
            result.append(data)
            
        return jsonify(result)

@bp.route('/watchlists', methods=['GET'])
async def get_watchlists():
    user_data = await auth_required(request)
    if isinstance(user_data, tuple):
        return user_data
        
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('SELECT * FROM watchlists')
        watchlists = await cursor.fetchall()
        return jsonify([dict(watchlist) for watchlist in watchlists])

@bp.route('/watchlists', methods=['POST'])
async def create_watchlist():
    user_data = await auth_required(request)
    if isinstance(user_data, tuple):
        return user_data
        
    data = await request.get_json()
    name = data.get('name')
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute('INSERT INTO watchlists (name) VALUES (?)', (name,))
        await db.commit()
        
        cursor = await db.execute('SELECT * FROM watchlists WHERE name = ?', (name,))
        watchlist = await cursor.fetchone()
        return jsonify(dict(watchlist)), 201

@bp.route('/watchlists/<int:watchlist_id>/stocks', methods=['POST'])
async def add_stock_to_watchlist(watchlist_id):
    user_data = await auth_required(request)
    if isinstance(user_data, tuple):
        return user_data
        
    data = await request.get_json()
    symbol = data.get('symbol')
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute(
            'INSERT INTO watchlist_items (watchlist_id, stock_symbol) VALUES (?, ?)',
            (watchlist_id, symbol)
        )
        await db.commit()
        return jsonify({"message": "Stock added to watchlist"}), 201

@bp.route('/watchlists/<int:watchlist_id>/stocks', methods=['GET'])
async def get_watchlist_stocks(watchlist_id):
    user_data = await auth_required(request)
    if isinstance(user_data, tuple):
        return user_data
        
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT s.* FROM stocks s
            JOIN watchlist_items wi ON wi.stock_symbol = s.symbol
            WHERE wi.watchlist_id = ?
        ''', (watchlist_id,))
        stocks = await cursor.fetchall()
        return jsonify([dict(stock) for stock in stocks])

# Public routes
@bp.route('/stocks', methods=['GET'])
async def get_stocks():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('SELECT * FROM stocks')
        stocks = await cursor.fetchall()
        return jsonify([dict(stock) for stock in stocks])

@bp.route('/stocks/latest', methods=['GET'])
async def get_latest_stocks():
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('SELECT * FROM stocks WHERE updated_at > ?', 
                                (datetime.now() - timedelta(minutes=5),))
        stocks = await cursor.fetchall()
        return jsonify([dict(stock) for stock in stocks])

@bp.route('/stocks/<symbol>/historical', methods=['GET'])
async def get_historical_data(symbol):
    timeframe = request.args.get('timeframe', '1M')
    
    end_date = datetime.now()
    if timeframe == '1D':
        start_date = end_date - timedelta(days=1)
    elif timeframe == '1W':
        start_date = end_date - timedelta(weeks=1)
    elif timeframe == '1M':
        start_date = end_date - timedelta(days=30)
    elif timeframe == '6M':
        start_date = end_date - timedelta(days=180)
    elif timeframe == '1Y':
        start_date = end_date - timedelta(days=365)
    else:  # All
        start_date = end_date - timedelta(days=1825)  # 5 years
    
    async with aiosqlite.connect(DATABASE_PATH) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT * FROM historical_data 
            WHERE stock_symbol = ? AND date BETWEEN ? AND ?
            ORDER BY date
        ''', (symbol, start_date.date(), end_date.date()))
        data = await cursor.fetchall()
        return jsonify([dict(point) for point in data])

# Data initialization endpoints
@bp.route('/stocks/init', methods=['POST'])
async def initialize_stocks():
    try:
        data = await request.get_json()
        stocks = data.get('stocks', [])
        
        async with aiosqlite.connect(DATABASE_PATH) as db:
            # Clear existing stocks
            await db.execute('DELETE FROM stocks')
            
            # Insert new stocks
            for stock in stocks:
                await db.execute('''
                    INSERT INTO stocks 
                    (symbol, name, price, change, change_percent, volume, sector, high, low, open)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    stock['symbol'], stock['name'], stock['price'], 
                    stock['change'], stock['changePercent'], stock['volume'],
                    stock['sector'], stock['high'], stock['low'], stock['open']
                ))
            
            await db.commit()
        return jsonify({"message": "Stocks initialized successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route('/portfolio/init', methods=['POST'])
async def initialize_portfolio():
    try:
        data = await request.get_json()
        portfolio = data.get('portfolio', {})
        
        async with aiosqlite.connect(DATABASE_PATH) as db:
            # Clear existing portfolio
            await db.execute('DELETE FROM portfolio')
            await db.execute('DELETE FROM portfolio_holdings')
            
            # Insert new portfolio
            await db.execute('''
                INSERT INTO portfolio 
                (cash, total_value, daily_change, daily_change_percent, 
                weekly_change, weekly_change_percent, monthly_change, monthly_change_percent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                portfolio['cash'], portfolio['totalValue'],
                portfolio['dailyChange'], portfolio['dailyChangePercent'],
                portfolio['weeklyChange'], portfolio['weeklyChangePercent'],
                portfolio['monthlyChange'], portfolio['monthlyChangePercent']
            ))
            
            # Insert holdings
            for holding in portfolio['holdings']:
                await db.execute('''
                    INSERT INTO portfolio_holdings (stock_id, shares, avg_cost)
                    VALUES (?, ?, ?)
                ''', (holding['stockId'], holding['shares'], holding['avgCost']))
            
            await db.commit()
        return jsonify({"message": "Portfolio initialized successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500