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

// This function is no longer needed as we're using the API service
// Frontend shouldn't directly connect to SQLite database
const connectToDatabase = async () => {
  try {
    console.log('Using API service for database operations');
    return null; // Return null as we're not actually connecting to a database directly
  } catch (error) {
    console.error('Error in database operation:', error);
    throw error;
  }
};

// Update stock data with server data
export const updateStocks = async (): Promise<Stock[]> => {
  try {
    const response = await api.getLatestStocks();
    if (response && response.length > 0) {
      return response;
    }
    return await getStocks(); // Fallback to regular stocks endpoint
  } catch (error) {
    console.error('Error updating stocks:', error);
    return mockStocks; // Return mock data as fallback
  }
};

// This function is no longer needed as we're using the API service
// Frontend shouldn't directly save to SQLite database
const saveStocksToDatabase = async (stocks) => {
  try {
    console.log('Using API service for database operations');
    // The actual saving is handled by the backend
  } catch (error) {
    console.error('Error in database operation:', error);
  }
};

// Get portfolio data
export const getPortfolio = async (): Promise<Portfolio> => {
  try {
    const response = await api.getPortfolio();
    return response;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return mockPortfolio; // Return mock data if API fails
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
    return mockPortfolio; // Return mock data if API fails
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
    let checkStocks = [];
    try {
      checkStocks = await getStocks();
    } catch (fetchError) {
      console.warn('Error checking existing stocks:', fetchError);
      // If we can't check stocks, we should try to initialize
      checkStocks = [];
    }
    
    if (checkStocks && checkStocks.length > 0) {
      console.log('Data already initialized');
      return; // Data already initialized
    }

    console.log('Initializing stocks and portfolio data...');
    // Initialize with mock data if no data exists
    try {
      // Initialize stocks first
      await api.initializeStocksData({ stocks: mockStocks });
      // Wait a short moment to ensure stocks are saved
      await new Promise(resolve => setTimeout(resolve, 500));
      // Then initialize portfolio
      await api.initializePortfolioData({ portfolio: mockPortfolio });

      // Verify initialization with retries
      let retryCount = 0;
      const maxRetries = 3;
      let initialized = false;

      while (retryCount < maxRetries && !initialized) {
        try {
          const [stocks, portfolio] = await Promise.all([
            getStocks(),
            getPortfolio()
          ]);

          if (stocks && stocks.length > 0 && portfolio) {
            console.log('Data initialization successful');
            initialized = true;
            break;
          }
          
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`Initialization verification attempt ${retryCount + 1}/${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (verifyError) {
          console.warn(`Verification attempt ${retryCount + 1} failed:`, verifyError);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!initialized) {
        const error = new Error('Data initialization verification failed after maximum retries');
        console.error(error);
        throw error;
      }
    } catch (initError) {
      console.error('API initialization failed:', initError);
      throw new Error(`Failed to initialize stock data: ${initError.message}`);
    }
  } catch (error) {
    console.error('Failed to initialize data:', error);
    throw new Error(`Data initialization failed: ${error.message}`);
  }
};
