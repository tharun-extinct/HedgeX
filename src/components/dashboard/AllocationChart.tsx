import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioAllocation } from '../../types/finance';

interface AllocationChartProps {
  getPortfolioAllocation: () => Promise<PortfolioAllocation[]>;
}

const COLORS = [
  '#3498db', // Blue
  '#2ecc71', // Green
  '#9b59b6', // Purple
  '#e74c3c', // Red
  '#f39c12', // Orange
  '#1abc9c', // Teal
  '#d35400', // Dark Orange
  '#2980b9', // Dark Blue
  '#27ae60', // Dark Green
  '#8e44ad'  // Dark Purple
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, index } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return percent > 0.05 ? (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

const AllocationChart = ({ getPortfolioAllocation }: AllocationChartProps) => {
  const [allocations, setAllocations] = useState<PortfolioAllocation[]>([]);
  const [view, setView] = useState<'pie' | 'table'>('pie');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getPortfolioAllocation();
        setAllocations(data);
      } catch (error) {
        console.error('Error loading allocation data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getPortfolioAllocation]);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border rounded shadow-md p-2 text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-xs">Value: {formatCurrency(payload[0].value)}</p>
          <p className="text-xs">Allocation: {payload[0].payload.percentage.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Portfolio Allocation</CardTitle>
            <CardDescription>
              Distribution by sector
            </CardDescription>
          </div>
          
          <Tabs value={view} onValueChange={(value) => setView(value as 'pie' | 'table')}>
            <TabsList>
              <TabsTrigger value="pie">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading allocation data...</p>
            </div>
          </div>
        ) : view === 'pie' ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocations}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="sector"
                >
                  {allocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left">Sector</th>
                  <th className="py-3 text-right">Value</th>
                  <th className="py-3 text-right">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((allocation, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      {allocation.sector}
                    </td>
                    <td className="py-3 text-right">
                      {formatCurrency(allocation.value)}
                    </td>
                    <td className="py-3 text-right">
                      {allocation.percentage.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AllocationChart;
