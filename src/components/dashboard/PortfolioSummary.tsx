import React from 'react';
import { ArrowDown, ArrowUp, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Portfolio } from '../../types/finance';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
}

const PortfolioSummary = ({ portfolio }: PortfolioSummaryProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const renderChangeIndicator = (value: number) => {
    if (value > 0) {
      return <ArrowUp className="h-4 w-4 text-finance-positive" />;
    } else if (value < 0) {
      return <ArrowDown className="h-4 w-4 text-finance-negative" />;
    }
    return null;
  };

  const renderValue = (value: number, includeSign = true) => {
    const className = value > 0 
      ? 'text-finance-positive' 
      : value < 0 
        ? 'text-finance-negative' 
        : 'text-muted-foreground';

    return (
      <span className={className}>
        {value > 0 && includeSign ? '+' : ''}
        {formatCurrency(value)}
      </span>
    );
  };

  const renderPercentage = (value: number) => {
    const className = value > 0 
      ? 'text-finance-positive' 
      : value < 0 
        ? 'text-finance-negative' 
        : 'text-muted-foreground';

    return (
      <span className={className}>
        {value > 0 ? '+' : ''}
        {value.toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Portfolio Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Portfolio Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(portfolio.totalValue)}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {renderChangeIndicator(portfolio.dailyChange)}
            {renderValue(portfolio.dailyChange)} ({renderPercentage(portfolio.dailyChangePercent)}) today
          </div>
        </CardContent>
      </Card>

      {/* Daily Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Change</CardTitle>
          <span className="rounded-md bg-muted px-2 py-1 text-xs">24h</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {renderValue(portfolio.dailyChange)}
          </div>
          <p className="text-xs text-muted-foreground">
            {renderPercentage(portfolio.dailyChangePercent)}
          </p>
        </CardContent>
      </Card>

      {/* Weekly Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Change</CardTitle>
          <span className="rounded-md bg-muted px-2 py-1 text-xs">7d</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {renderValue(portfolio.weeklyChange)}
          </div>
          <p className="text-xs text-muted-foreground">
            {renderPercentage(portfolio.weeklyChangePercent)}
          </p>
        </CardContent>
      </Card>

      {/* Monthly Change */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Change</CardTitle>
          <span className="rounded-md bg-muted px-2 py-1 text-xs">30d</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {renderValue(portfolio.monthlyChange)}
          </div>
          <p className="text-xs text-muted-foreground">
            {renderPercentage(portfolio.monthlyChangePercent)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
