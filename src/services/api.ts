const API_BASE_URL = 'http://localhost:8070/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const getPortfolio = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }
  
  return response.json();
};

export const getLatestPortfolio = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio/latest`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch latest portfolio');
  }
  
  return response.json();
};

export const getPortfolioAllocation = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio/allocation`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio allocation');
  }
  
  return response.json();
};

export const getWatchlists = async () => {
  const response = await fetch(`${API_BASE_URL}/watchlists`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch watchlists');
  }
  
  return response.json();
};

export const createWatchlist = async (name: string) => {
  const response = await fetch(`${API_BASE_URL}/watchlists`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name })
  });
  
  if (!response.ok) {
    throw new Error('Failed to create watchlist');
  }
  
  return response.json();
};

export const addStockToWatchlist = async (watchlistId: number, symbol: string) => {
  const response = await fetch(`${API_BASE_URL}/watchlists/${watchlistId}/stocks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ symbol })
  });
  
  if (!response.ok) {
    throw new Error('Failed to add stock to watchlist');
  }
  
  return response.json();
};

export const getWatchlistStocks = async (watchlistId: number) => {
  const response = await fetch(`${API_BASE_URL}/watchlists/${watchlistId}/stocks`, {
    headers: getAuthHeaders()
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch watchlist stocks');
  }
  
  return response.json();
};

// Public endpoints
export const getStocks = async () => {
  const response = await fetch(`${API_BASE_URL}/stocks`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch stocks');
  }
  
  return response.json();
};

export const getLatestStocks = async () => {
  const response = await fetch(`${API_BASE_URL}/stocks/latest`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch latest stocks');
  }
  
  return response.json();
};

export const getHistoricalData = async (symbol: string, timeframe: string = '1M') => {
  const response = await fetch(`${API_BASE_URL}/stocks/${symbol}/historical?timeframe=${timeframe}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch historical data');
  }
  
  return response.json();
};

// Initialize stocks data
export const initializeStocksData = async (data: { stocks: any[] }) => {
  const response = await fetch(`${API_BASE_URL}/stocks/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to initialize stocks data');
  }

  return response.json();
};

// Initialize portfolio data
export const initializePortfolioData = async (data: { portfolio: any }) => {
  const response = await fetch(`${API_BASE_URL}/portfolio/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error('Failed to initialize portfolio data');
  }

  return response.json();
};

// Create default export with all API functions
export default {
  getPortfolio,
  getLatestPortfolio,
  getPortfolioAllocation,
  getWatchlists,
  createWatchlist,
  addStockToWatchlist,
  getWatchlistStocks,
  getStocks,
  getLatestStocks,
  getHistoricalData,
  initializeStocksData,
  initializePortfolioData
};