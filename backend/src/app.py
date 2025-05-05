import sys
from quart import Quart, jsonify
from quart_cors import cors
from routes.api import bp as api_bp

app = Quart(__name__)

# Allow requests from development and production frontend ports
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:8080",  # Production
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080"
]

app = cors(app, allow_origin=ALLOWED_ORIGINS)

# Register blueprints
app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/')
async def root():
    return jsonify({"message": "Welcome to HedgeX API"})

@app.route('/health')
async def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8070, debug=True)