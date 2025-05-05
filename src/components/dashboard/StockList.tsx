import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Stock } from '../../types/finance';

interface StockListProps {
  stocks: Stock[];
  selectedStock: string | null;
  onSelectStock: (symbol: string) => void;
}

const StockList = ({ stocks, selectedStock, onSelectStock }: StockListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const formatLargeNumber = (value: number) => {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2) + 'B';
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(2) + 'M';
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(2) + 'K';
    }
    return value.toString();
  };

  // Filter stocks based on search term
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Stocks</CardTitle>
        </div>
        <CardDescription>
          Select a stock to view detailed performance
        </CardDescription>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stocks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full">
            <thead className="border-b sticky top-0 bg-card z-10">
              <tr>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Symbol</th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Price</th>
                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => {
                const isSelected = selectedStock === stock.symbol;
                const changeColor = stock.changePercent > 0 
                  ? 'text-finance-positive' 
                  : stock.changePercent < 0 
                    ? 'text-finance-negative' 
                    : 'text-muted-foreground';
                
                return (
                  <tr 
                    key={stock.id}
                    onClick={() => onSelectStock(stock.symbol)}
                    className={`
                      border-b last:border-0 cursor-pointer 
                      hover:bg-muted/50 transition-colors
                      ${isSelected ? 'bg-muted/80' : ''}
                    `}
                  >
                    <td className="p-3">
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground">{stock.name}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-medium">{formatCurrency(stock.price)}</div>
                      <div className="text-xs text-muted-foreground">Vol: {formatLargeNumber(stock.volume)}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className={`font-medium flex items-center justify-end ${changeColor}`}>
                        {stock.changePercent > 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : stock.changePercent < 0 ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : null}
                        {stock.changePercent > 0 ? '+' : ''}
                        {stock.changePercent?.toFixed(2) ?? '0.00'}%
                      </div>
                      <div className={`text-xs ${changeColor}`}>
                        {stock.change > 0 ? '+' : ''}
                        {formatCurrency(stock.change)}
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredStocks.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-muted-foreground">
                    No stocks found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockList;
