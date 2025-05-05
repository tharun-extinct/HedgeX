import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricalDataPoint, Timeframe } from '../../types/finance';

interface PerformanceChartProps {
  selectedStock: string | null;
  selectedTimeframe: Timeframe;
  onTimeframeChange: (timeframe: Timeframe) => void;
  getHistoricalData: (symbol: string, timeframe: Timeframe) => Promise<HistoricalDataPoint[]>;
}

const PerformanceChart = ({
  selectedStock,
  selectedTimeframe,
  onTimeframeChange,
  getHistoricalData
}: PerformanceChartProps) => {
  const [chartData, setChartData] = useState<HistoricalDataPoint[]>([]);
  const [startValue, setStartValue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      if (!selectedStock) return;
      
      setIsLoading(true);
      try {
        const data = await getHistoricalData(selectedStock, selectedTimeframe);
        setChartData(data);
        if (data.length > 0) {
          setStartValue(data[0].close);
        }
      } catch (error) {
        console.error('Error loading historical data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedStock, selectedTimeframe, getHistoricalData]);

  // Calculate price change
  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : 0;
  const priceChange = lastPrice - startValue;
  const percentChange = (priceChange / startValue) * 100;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance</CardTitle>
            <CardDescription>
              {selectedStock ? (
                <div className="flex items-baseline gap-2">
                  <span>
                    ${lastPrice.toFixed(2)}
                  </span>
                  <span className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
                  </span>
                </div>
              ) : (
                'Select a stock to view performance'
              )}
            </CardDescription>
          </div>
          
          <Tabs value={selectedTimeframe} onValueChange={(value) => onTimeframeChange(value as Timeframe)}>
            <TabsList>
              <TabsTrigger value="1D">1D</TabsTrigger>
              <TabsTrigger value="1W">1W</TabsTrigger>
              <TabsTrigger value="1M">1M</TabsTrigger>
              <TabsTrigger value="6M">6M</TabsTrigger>
              <TabsTrigger value="1Y">1Y</TabsTrigger>
              <TabsTrigger value="All">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading data...</p>
            </div>
          </div>
        ) : !selectedStock ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Select a stock to view performance
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return selectedTimeframe === '1D' 
                      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : date.toLocaleDateString();
                  }}
                />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip 
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return selectedTimeframe === '1D'
                      ? date.toLocaleTimeString()
                      : date.toLocaleDateString();
                  }}
                />
                <ReferenceLine y={startValue} stroke="#888" strokeDasharray="3 3" />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="hsl(var(--primary))" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;
