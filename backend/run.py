import os
import sys
import asyncio
from pathlib import Path

# Add the parent directory and src directory to Python path to enable imports
current_dir = Path(__file__).parent
src_dir = current_dir / 'src'
sys.path.append(str(current_dir))
sys.path.append(str(src_dir))

from src.app import app
from src.database.database import init_db
from src.database.init_db import init_sample_data

# Initialize database and sample data before starting the server
async def setup():
    print("Initializing database...")
    await init_db()
    print("Initializing sample data...")
    await init_sample_data()
    print("Database setup complete!")

if __name__ == "__main__":
    # Run the setup asynchronously
    asyncio.run(setup())
    # Start the server
    app.run(host='127.0.0.1', port=8070, debug=True)