import { Stock, Portfolio, PortfolioAllocation, HistoricalDataPoint, Timeframe } from '../types/finance';
import api from './api';

// Mock stock data
const mockStocks: Stock[] = [
  { 
    id: '1', 
    symbol: 'AAPL', 
    name: 'Apple Inc.', 
    price: 174.23, 
    change: 1.25, 
    changePercent: 0.72, 
    volume: 48956321, 
    sector: 'Technology',
    high: 175.10,
    low: 173.05,
    open: 173.50
  },
  { 
    id: '2', 
    symbol: 'MSFT', 
    name: 'Microsoft Corporation', 
    price: 328.79, 
    change: 2.56, 
    changePercent: 0.78, 
    volume: 21542632, 
    sector: 'Technology',
    high: 330.15,
    low: 326.90,
    open: 327.20
  }
];

// Mock portfolio data
const mockPortfolio: Portfolio = {
  cash: 25000.00,
  totalValue: 163524.87,
  dailyChange: 1432.56,
  dailyChangePercent: 0.88,
  weeklyChange: 3256.78,
  weeklyChangePercent: 2.03,
  monthlyChange: 6789.12,
  monthlyChangePercent: 4.32,
  holdings: [
    { stockId: '1', shares: 50, avgCost: 165.42 },
    { stockId: '2', shares: 20, avgCost: 320.15 }
  ]
};

// Generate random historical data
const generateHistoricalData = (stockSymbol: string, days: number): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const basePrice = mockStocks.find(s => s.symbol === stockSymbol)?.price || 100;
  const volatility = 0.02; // 2% volatility
  
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random price movement with trend
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    currentPrice = Math.max(0.1, currentPrice + change);
    
    // Add some noise to volume
    const volume = Math.floor(Math.random() * 10000000) + 1000000;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: currentPrice * (1 - Math.random() * 0.01),
      high: currentPrice * (1 + Math.random() * 0.015),
      low: currentPrice * (1 - Math.random() * 0.015),
      close: currentPrice,
      volume
    });
  }
  
  return data;
};

// Calculate portfolio allocation
const calculateAllocation = (stocks: Stock[], portfolio: Portfolio): PortfolioAllocation[] => {
  const stockMap = new Map(stocks.map(stock => [stock.id, stock]));
  const sectorTotals = new Map<string, number>();
  let totalValue = 0;
  
  // Calculate total value and sector totals
  portfolio.holdings.forEach(holding => {
    const stock = stockMap.get(holding.stockId);
    if (stock) {
      const value = stock.price * holding.shares;
      totalValue += value;
      
      const sector = stock.sector;
      sectorTotals.set(sector, (sectorTotals.get(sector) || 0) + value);
    }
  });
  
  // Create allocation objects
  const allocations: PortfolioAllocation[] = [];
  sectorTotals.forEach((value, sector) => {
    allocations.push({
      sector,
      value,
      percentage: (value / totalValue) * 100
    });
  });
  
  return allocations;
};

// Get stocks data
// Get stocks data
export const getStocks = async (): Promise<Stock[]> => {
  try {
    const response = await api.getStocks();
    return response;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return [];
  }
};

// Connect to a persistent SQLite database
const connectToDatabase = async () => {
  try {
    const db = await openDatabase('path/to/your/database/file.sqlite');
    console.log('Connected to the database successfully');
    return db;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
};

// Update stock data with server data
export const updateStocks = async (): Promise<Stock[]> => {
  try {
    const db = await connectToDatabase();
    const response = await api.getLatestStocks();
    if (response && response.length > 0) {
      // Save data to the database
      await saveStocksToDatabase(db, response);
      return response;
    }
    return await getStocks(); // Fallback to regular stocks endpoint
  } catch (error) {
    console.error('Error updating stocks:', error);
    return [];
  }
};

// Function to save stocks to the database
const saveStocksToDatabase = async (db, stocks) => {
  try {
    const insertQuery = 'INSERT INTO stocks (id, symbol, name, price, change, changePercent, volume, sector, high, low, open) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    for (const stock of stocks) {
      await db.run(insertQuery, [stock.id, stock.symbol, stock.name, stock.price, stock.change, stock.changePercent, stock.volume, stock.sector, stock.high, stock.low, stock.open]);
    }
    console.log('Stocks saved to the database successfully');
  } catch (error) {
    console.error('Error saving stocks to the database:', error);
  }
};

// Get portfolio data
export const getPortfolio = async (): Promise<Portfolio> => {
  try {
    const response = await api.getPortfolio();
    return response;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return null; // Return null if API fails
  }
};

// Update portfolio
export const updatePortfolio = async (): Promise<Portfolio> => {
  try {
    const response = await api.getLatestPortfolio();
    if (response) {
      return response;
    }
    return await getPortfolio(); // Fallback to regular portfolio endpoint
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return null; // Return null if API fails
  }
};

// Get historical data for a stock
export const getHistoricalData = async (symbol: string, timeframe: Timeframe): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await api.getHistoricalData(symbol, timeframe);
    return response;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    
    // Fallback to generating data if API fails
    const data: HistoricalDataPoint[] = [];
    const now = new Date();
    const points = timeframe === '1D' ? 24 : 30;
    const basePrice = mockStocks.find(s => s.symbol === symbol)?.price || 100;
    let currentPrice = basePrice;
    
    for (let i = points; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * (timeframe === '1D' ? 3600000 : 86400000)));
      const change = (Math.random() - 0.5) * 0.02 * currentPrice; // 2% volatility
      currentPrice = Math.max(0.1, currentPrice + change);
      
      data.push({
        date: date.toISOString(),
        open: currentPrice * (1 - Math.random() * 0.01),
        high: currentPrice * (1 + Math.random() * 0.015),
        low: currentPrice * (1 - Math.random() * 0.015),
        close: currentPrice,
        volume: Math.floor(Math.random() * 10000000) + 1000000
      });
    }
    
    return data;
  }
};

// Get portfolio allocation
export const getPortfolioAllocation = async (): Promise<PortfolioAllocation[]> => {
  try {
    const response = await api.getPortfolioAllocation();
    return response;
  } catch (error) {
    console.error('Error fetching portfolio allocation:', error);
    // Fallback to mock data if API fails
    return [
      { sector: 'Technology', value: 10000, percentage: 40 },
      { sector: 'Healthcare', value: 5000, percentage: 20 },
      { sector: 'Finance', value: 7500, percentage: 30 },
      { sector: 'Consumer', value: 2500, percentage: 10 }
    ];
  }
};

export const initializeStocksData = async (): Promise<void> => {
  try {
    // First check if we already have data initialized
    const checkStocks = await getStocks();
    if (checkStocks && checkStocks.length > 0) {
      console.log('Data already initialized');
      return; // Data already initialized
    }

    console.log('Initializing stocks and portfolio data...');
    // Initialize with mock data if no data exists
    try {
      await Promise.all([
        api.initializeStocksData({ stocks: mockStocks }),
        api.initializePortfolioData({ portfolio: mockPortfolio })
      ]);

      // Verify initialization
      const [stocks, portfolio] = await Promise.all([
        getStocks(),
        getPortfolio()
      ]);

      if (!stocks || stocks.length === 0 || !portfolio) {
        console.warn('Data initialization verification failed, using mock data');
        // Continue with mock data instead of throwing
      } else {
        console.log('Data initialization successful');
      }
    } catch (initError) {
      console.warn('API initialization failed, falling back to mock data:', initError);
      // Continue with application flow even if initialization fails
    }
  } catch (error) {
    console.error('Failed to initialize data:', error);
    // Don't throw the error, just log it and continue
    // This prevents the white screen after login
  }
};
