import React, { useState, useEffect } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
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
  const [currentWatchlistName, setCurrentWatchlistName] = useState<string>('Default Watchlist');

  useEffect(() => {
    const activeWatchlist = watchlists.find(watchlist => watchlist.id === selectedStock);
    if (activeWatchlist) {
      setCurrentWatchlistName(activeWatchlist.name);
    }
  }, [selectedStock, watchlists]);

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{currentWatchlistName}</h3>
        </div>
      </div>
    </div>
  );
};

export default WatchlistManager;