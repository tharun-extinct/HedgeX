import React, { useState, useEffect } from 'react';
import { 
  getStocks, 
  getPortfolio, 
  updateStocks, 
  updatePortfolio,
  getHistoricalData,
  getPortfolioAllocation,
  initializeStocksData
} 


from '../services/financialData';
import { Stock, Portfolio, Timeframe } from '../types/finance';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import StockList from '../components/dashboard/StockList';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import AllocationChart from '../components/dashboard/AllocationChart';
import WatchlistManager from '../components/dashboard/WatchlistManager';

const Dashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Key to force re-mount of the PortfolioSummary component
  const [portfolioKey, setPortfolioKey] = useState(Date.now());
  
  // Tab state for main content
  const [activeTab, setActiveTab] = useState<'stocks' | 'watchlist'>('stocks');

  // Initialize data on component mount
  useEffect(() => {
    // Each time Dashboard mounts, update the key to force a re-mount of PortfolioSummary
    setPortfolioKey(Date.now());
    
    loadData();
    
    // Set up interval for simulated real-time updates
    const intervalId = setInterval(async () => {
      try {
        const updatedStocks = await updateStocks();
        const updatedPortfolio = await updatePortfolio();
        
        if (updatedStocks) setStocks(updatedStocks);
        if (updatedPortfolio) setPortfolio(updatedPortfolio);
      } catch (error) {
        console.error('Error updating real-time data:', error);
      }
    }, 8000); // Update every 8 seconds
    
    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    
    try {
      const [stocksData, portfolioData] = await Promise.all([
        getStocks(),
        getPortfolio()
      ]);
      
      if (stocksData) setStocks(stocksData);
      if (portfolioData) setPortfolio(portfolioData);
      
      // Select the first stock by default if none is selected
      if (!selectedStock && stocksData && stocksData.length > 0) {
        setSelectedStock(stocksData[0].symbol);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-muted-foreground">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if no data loaded
  if (!portfolio && (!stocks || stocks.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500 font-semibold">Unable to load dashboard data.</p>
          <p className="mt-2 text-muted-foreground">Please check your connection or try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        {portfolio && (
          <>
            {/* Portfolio Summary with key to force re-mount */}
            <PortfolioSummary 
              key={portfolioKey} 
              portfolio={portfolio} 
            />
            
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
              {/* Left Column - Stocks or Watchlist */}
              <div className="lg:col-span-4">
                <div className="flex mb-4 border-b">
                  <button 
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'stocks' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('stocks')}
                  >
                    Stocks
                  </button>
                  <button 
                    className={`px-4 py-2 font-medium text-sm ${activeTab === 'watchlist' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}
                    onClick={() => setActiveTab('watchlist')}
                  >
                    Watchlists
                  </button>
                </div>

                {activeTab === 'stocks' ? (
                  <StockList 
                    stocks={stocks} 
                    selectedStock={selectedStock}
                    onSelectStock={(symbol) => setSelectedStock(symbol)}
                  />
                ) : (
                  <WatchlistManager
                    stocks={stocks}
                    selectedStock={selectedStock}
                    onSelectStock={(symbol) => setSelectedStock(symbol)}
                  />
                )}
              </div>
              
              {/* Charts */}
              <div className="lg:col-span-8 space-y-6">
                <PerformanceChart 
                  selectedStock={selectedStock}
                  selectedTimeframe={selectedTimeframe}
                  onTimeframeChange={setSelectedTimeframe}
                  getHistoricalData={getHistoricalData}
                />
                
                <AllocationChart 
                  getPortfolioAllocation={getPortfolioAllocation}
                />
              </div>
            </div>
          </>
        )}
      </main>
      
      <footer className="py-4 px-6 border-t text-sm text-muted-foreground text-center">
        <p>
          &copy; {new Date().getFullYear()} FinView. All data is simulated for demonstration purposes only.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
