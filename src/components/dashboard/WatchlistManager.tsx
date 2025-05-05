import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Star, X } from 'lucide-react';
import { Stock, Watchlist } from '@/types/finance';
import { 
  getWatchlists, 
  getWatchlistStocks,
  addStockToWatchlist,
  removeStockFromWatchlist,
  createWatchlist,
  deleteWatchlist,
  updateWatchlistName
} from '@/services/watchlistService';
import { useToast } from '@/hooks/use-toast';

interface WatchlistManagerProps {
  stocks: Stock[];
  selectedStock: string | null;
  onSelectStock: (symbol: string) => void;
}

const WatchlistManager = ({ stocks, selectedStock, onSelectStock }: WatchlistManagerProps) => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeWatchlist, setActiveWatchlist] = useState<string>('');
  const [watchlistStocks, setWatchlistStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load watchlists on mount
  useEffect(() => {
    loadWatchlists();
  }, []);

  // Update watchlist stocks when active watchlist changes
  useEffect(() => {
    if (activeWatchlist) {
      loadWatchlistStocks();
    }
  }, [activeWatchlist]);

  const loadWatchlists = async () => {
    setIsLoading(true);
    try {
      const loadedWatchlists = await getWatchlists();
      setWatchlists(loadedWatchlists);
      if (loadedWatchlists.length > 0 && !activeWatchlist) {
        setActiveWatchlist(loadedWatchlists[0].id);
      }
    } catch (error) {
      console.error('Error loading watchlists:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load watchlists"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadWatchlistStocks = async () => {
    if (!activeWatchlist) return;
    
    setIsLoading(true);
    try {
      const stocks = await getWatchlistStocks(activeWatchlist);
      setWatchlistStocks(stocks);
    } catch (error) {
      console.error('Error loading watchlist stocks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load watchlist stocks"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStock = async (stockId: string) => {
    if (!activeWatchlist) return;
    
    try {
      await addStockToWatchlist(activeWatchlist, stockId);
      loadWatchlistStocks(); // Reload stocks after adding
      toast({
        title: "Success",
        description: "Stock added to watchlist"
      });
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add stock to watchlist"
      });
    }
  };

  const handleRemoveStock = async (stockId: string) => {
    if (!activeWatchlist) return;
    
    try {
      await removeStockFromWatchlist(activeWatchlist, stockId);
      loadWatchlistStocks(); // Reload stocks after removing
      toast({
        title: "Success",
        description: "Stock removed from watchlist"
      });
    } catch (error) {
      console.error('Error removing stock from watchlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove stock from watchlist"
      });
    }
  };

  const handleCreateWatchlist = async (name: string) => {
    try {
      await createWatchlist(name);
      loadWatchlists(); // Reload watchlists after creating new one
      toast({
        title: "Success",
        description: "Watchlist created successfully"
      });
    } catch (error) {
      console.error('Error creating watchlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create watchlist"
      });
    }
  };

  const handleDeleteWatchlist = async (watchlistId: string) => {
    try {
      await deleteWatchlist(watchlistId);
      loadWatchlists(); // Reload watchlists after deleting
      if (activeWatchlist === watchlistId) {
        setActiveWatchlist('');
      }
      toast({
        title: "Success",
        description: "Watchlist deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete watchlist"
      });
    }
  };

  const handleRenameWatchlist = async (watchlistId: string, newName: string) => {
    try {
      await updateWatchlistName(watchlistId, newName);
      loadWatchlists(); // Reload watchlists after renaming
      toast({
        title: "Success",
        description: "Watchlist renamed successfully"
      });
    } catch (error) {
      console.error('Error renaming watchlist:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to rename watchlist"
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveWatchlist(value);
  };

  const handleAddToWatchlist = (stock: Stock) => {
    const updatedWatchlists = addStockToWatchlist(activeWatchlist, stock.id);
    setWatchlists(updatedWatchlists);
    
    // Refresh the watchlist stocks
    const updatedStocks = getWatchlistStocks(activeWatchlist);
    setWatchlistStocks(updatedStocks);
    
    toast({
      title: "Added to watchlist",
      description: `${stock.symbol} added to ${watchlists.find(w => w.id === activeWatchlist)?.name}`,
    });
  };

  const handleRemoveFromWatchlist = (stockId: string) => {
    const stock = watchlistStocks.find(s => s.id === stockId);
    if (!stock) return;
    
    const updatedWatchlists = removeStockFromWatchlist(activeWatchlist, stockId);
    setWatchlists(updatedWatchlists);
    
    // Refresh the watchlist stocks
    const updatedStocks = getWatchlistStocks(activeWatchlist);
    setWatchlistStocks(updatedStocks);
    
    toast({
      title: "Removed from watchlist",
      description: `${stock.symbol} removed from ${watchlists.find(w => w.id === activeWatchlist)?.name}`,
    });
  };

  // Get current watchlist name
  const currentWatchlistName = watchlists.find(w => w.id === activeWatchlist)?.name || 'Watchlist';

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{currentWatchlistName}</h3>
        </div>
      </div>
      
      <Tabs value={activeWatchlist} onValueChange={handleTabChange} className="w-full">
        <div className="px-4 border-b overflow-x-auto">
          <TabsList className="w-full justify-start">
            {watchlists.map((watchlist) => (
              <TabsTrigger 
                key={watchlist.id} 
                value={watchlist.id}
                className="px-3 py-1 text-xs"
              >
                {watchlist.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {watchlists.map((watchlist) => (
          <TabsContent key={watchlist.id} value={watchlist.id} className="p-0 m-0">
            <div className="overflow-auto max-h-[360px]">
              {watchlistStocks.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No stocks in this watchlist</p>
                  <p className="text-sm">Add stocks to track them here</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Symbol</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Price</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Change</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchlistStocks.map((stock) => (
                      <tr 
                        key={stock.id} 
                        className={`border-b hover:bg-muted/50 cursor-pointer ${selectedStock === stock.symbol ? 'bg-muted/80' : ''}`}
                        onClick={() => onSelectStock(stock.symbol)}
                      >
                        <td className="p-3">
                          <div className="font-medium">{stock.symbol}</div>
                          <div className="text-xs text-muted-foreground">{stock.name}</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-medium">${stock.price.toFixed(2)}</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className={`text-sm ${stock.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWatchlist(stock.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="p-4 border-t">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Stocks
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-4 border-b">
              <h4 className="font-medium">Add to {currentWatchlistName}</h4>
              <p className="text-sm text-muted-foreground">Select stocks to add to your watchlist</p>
            </div>
            <div className="max-h-[300px] overflow-auto">
              {stocks
                .filter(stock => !watchlistStocks.some(ws => ws.id === stock.id))
                .map(stock => (
                  <div 
                    key={stock.id} 
                    className="flex items-center justify-between p-3 hover:bg-muted cursor-pointer border-b"
                    onClick={() => handleAddToWatchlist(stock)}
                  >
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              }
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default WatchlistManager;
