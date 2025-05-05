// Stock data type
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  sector: string;
  high: number;
  low: number;
  open: number;
}

// Portfolio holding type
export interface Holding {
  stockId: string;
  shares: number;
  avgCost: number;
}

// Portfolio type
export interface Portfolio {
  cash: number;
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  weeklyChange: number;
  weeklyChangePercent: number;
  monthlyChange: number;
  monthlyChangePercent: number;
  holdings: Holding[];
}

// Watchlist type
export interface Watchlist {
  id: string;
  name: string;
  stocks: string[]; // Array of stock IDs
}

// Portfolio allocation by sector
export interface PortfolioAllocation {
  sector: string;
  value: number;
  percentage: number;
}

// Historical price data point
export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Timeframe options for charts
export type Timeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | 'All';
