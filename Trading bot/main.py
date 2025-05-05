import yfinance as yf
import pandas as pd
import pandas_ta as ta
from datetime import datetime
import logging
import traceback  # Added import

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
TICKER = "RELIANCE.NS"  # NSE symbol
INTERVAL = "15m"        # 15-minute interval
PERIOD = "5d"          # Increased to 5 days to get more data points

# Fetch OHLCV data
def fetch_data(ticker, interval, period):
    try:
        logger.info(f"Fetching data for {ticker} at {interval} interval for {period}")
        df = yf.download(tickers=ticker, interval=interval, period=period)
        if df.empty:
            logger.error("No data received from yfinance")
            return None
            
        # Fix: Handle tuple column names by taking first element
        df.columns = [col[0].lower() if isinstance(col, tuple) else str(col).lower() for col in df.columns]
        logger.info(f"Data fetched successfully. Columns: {df.columns.tolist()}")
        return df
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        return None

# Breakout Strategy
def breakout_strategy(df, window=10):  # Reduced from 20 to 10
    df = df.copy()
    
    print("Available columns:", df.columns.tolist())
    
    # No need to check for capitalization since we standardized in fetch_data
    required_columns = ['high', 'low', 'close']
    if not all(col in df.columns for col in required_columns):
        raise ValueError(f"Missing required columns. Available columns: {df.columns.tolist()}")
    
    # Add volume confirmation with more lenient threshold
    df['volume_ma'] = df['volume'].rolling(window=window).mean()
    df['volume_surge'] = df['volume'] > df['volume_ma'] * 1.2  # Reduced from 1.5 to 1.2
    
    # Calculate rolling highs/lows
    df['range_high'] = df['high'].rolling(window).max()
    df['range_low'] = df['low'].rolling(window).min()
    
    # Add price momentum
    df['price_momentum'] = df['close'].pct_change(3)  # 3-period momentum
    
    # Shift to avoid lookahead bias
    df['range_high_shifted'] = df['range_high'].shift(1)
    df['range_low_shifted'] = df['range_low'].shift(1)
    
    # Now drop NaNs from all these columns after creation
    df.dropna(subset=['close', 'range_high_shifted', 'range_low_shifted', 'volume_ma', 'price_momentum'], inplace=True)
    
    # Add momentum confirmation to breakout signals
    df['breakout_long'] = (df['close'] > df['range_high_shifted']) & (df['volume_surge'] | (df['price_momentum'] > 0))
    df['breakout_short'] = (df['close'] < df['range_low_shifted']) & (df['volume_surge'] | (df['price_momentum'] < 0))
    
    return df[['breakout_long', 'breakout_short']]

# Trend Following Strategy
def trend_following(df, fast=8, slow=21):  # Changed from 20,50 to 8,21 for faster signals
    df = df.copy()
    df['ema_fast'] = df['close'].ewm(span=fast).mean()
    df['ema_slow'] = df['close'].ewm(span=slow).mean()
    
    # Add RSI with more lenient conditions
    df['rsi'] = ta.rsi(df['close'], length=14)
    
    # More lenient RSI conditions
    df['long'] = (df['ema_fast'] > df['ema_slow']) & (df['rsi'] < 75)  # Increased from 70
    df['short'] = (df['ema_fast'] < df['ema_slow']) & (df['rsi'] > 25)  # Decreased from 30
    return df[['long', 'short']]

# Reversal at Extremes using Bollinger Bands
def bollinger_reversal(df, window=14):  # Changed from 20 to 14
    df = df.copy()
    bb = ta.bbands(df['close'], length=window)
    df = pd.concat([df, bb], axis=1)
    
    # Add more lenient conditions with price confirmation
    df['price_change'] = df['close'].pct_change()
    df['long'] = (df['close'] < df[f'BBL_{window}_2.0']) | (df['price_change'] < -0.01)  # 1% down move
    df['short'] = (df['close'] > df[f'BBU_{window}_2.0']) | (df['price_change'] > 0.01)  # 1% up move
    return df[['long', 'short']]

# Combine signals
def combined_signals(df):
    df1 = breakout_strategy(df.copy())
    df2 = trend_following(df.copy())
    df3 = bollinger_reversal(df.copy())
    
    signals = pd.DataFrame(index=df.index)
    
    # Count how many long/short signals we have at each point
    long_count = df1['breakout_long'].astype(int) + df2['long'].astype(int) + df3['long'].astype(int)
    short_count = df1['breakout_short'].astype(int) + df2['short'].astype(int) + df3['short'].astype(int)
    
    # More lenient signal generation - require only 1.5 average signal strength
    signals['LONG'] = (long_count >= 1.5)
    signals['SHORT'] = (short_count >= 1.5)
    
    # Fix: Create proper DataFrame for signal strength calculation
    strength_df = pd.DataFrame({
        'long_strength': long_count,
        'short_strength': short_count
    }, index=df.index)
    signals['signal_strength'] = strength_df.max(axis=1)
    
    signals['last_signal_time'] = None
    signals.loc[signals['LONG'] | signals['SHORT'], 'last_signal_time'] = datetime.now()
    signals['long_persistence'] = signals['LONG'].astype(int).rolling(window=3).sum()
    signals['short_persistence'] = signals['SHORT'].astype(int).rolling(window=3).sum()
    
    return signals

# Run
def run_strategy():
    try:
        # Add file handler for debugging
        file_handler = logging.FileHandler('trading_bot.log')
        file_handler.setLevel(logging.INFO)
        logger.addHandler(file_handler)
        
        logger.info(f"Starting strategy run for {TICKER}")
        df = fetch_data(TICKER, INTERVAL, PERIOD)
        if df is None or df.empty:
            logger.error("No data available for processing")
            return

        analysis_output = []  # Store output for both console and file
        
        analysis_output.append(f"\nAnalyzing {TICKER} data:")
        analysis_output.append(f"Timeframe: {INTERVAL}")
        analysis_output.append(f"Period: {PERIOD}")
        analysis_output.append(f"Data points: {len(df)}")
        
        analysis_output.append("\nRecent market activity:")
        recent_data = df[['open', 'high', 'low', 'close', 'volume']].tail()
        analysis_output.append(str(recent_data))
        
        recent_close = df['close'].iloc[-1]
        prev_close = df['close'].iloc[-2]
        price_change = ((recent_close - prev_close) / prev_close) * 100
        
        analysis_output.append(f"\nCurrent price: {recent_close:.2f}")
        analysis_output.append(f"Price change: {price_change:.2f}%")

        signals = combined_signals(df)
        filtered_signals = signals[signals['LONG'] | signals['SHORT']]
        
        if filtered_signals.empty:
            analysis_output.append("\nNo active trading signals")
            analysis_output.append("\nSignal strength in recent periods:")
            signal_info = signals[['signal_strength', 'long_persistence', 'short_persistence']].tail()
            analysis_output.append(str(signal_info))
            
            threshold = 1
            close_signals = signals[signals['signal_strength'] >= threshold].tail()
            if not close_signals.empty:
                analysis_output.append("\nNear-signal conditions (periods with at least one strategy agreement):")
                analysis_output.append(str(close_signals))
        else:
            analysis_output.append("\nActive trading signals found:")
            analysis_output.append(str(filtered_signals.tail()))
        
        # Write to both console and file
        output_text = '\n'.join(analysis_output)
        print(output_text)
        with open('trading_output.txt', 'w') as f:
            f.write(output_text)
            
    except Exception as e:
        error_msg = f"Error in strategy execution: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        with open('trading_error.txt', 'w') as f:
            f.write(error_msg)

if __name__ == "__main__":
    run_strategy()
