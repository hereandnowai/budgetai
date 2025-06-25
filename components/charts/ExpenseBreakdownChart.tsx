
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ForecastData, ChartDataItem, ForecastPoint } from '../../types';
import { BRAND_COLORS_HEX } from '../../constants';

interface ExpenseBreakdownChartProps {
  forecastData: ForecastData; 
}

const CHART_COLORS = [
  BRAND_COLORS_HEX.primary, 
  BRAND_COLORS_HEX.secondary, 
  '#F0C808', // Lighter primary shade
  '#005F5F', // Darker secondary shade
  '#D4A000', // Darker primary shade
  '#007F7F', // Lighter secondary shade
];

export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({ forecastData }) => {
  // Aggregate expense data by category from forecast points
  const aggregatedExpenses: { [key: string]: number } = {};
  forecastData.points.forEach(point => {
    const category = point.category || 'Uncategorized';
    aggregatedExpenses[category] = (aggregatedExpenses[category] || 0) + point.value;
  });

  const chartData: ChartDataItem[] = Object.entries(aggregatedExpenses)
    .map(([name, value]) => ({
      name,
      value1: value, // Use value1 as per ChartDataItem for the primary value
    }))
    .slice(0, 6); // Take first 6 for pie chart display


  if (chartData.length === 0) {
    return <div className="p-4 text-gray-500 text-center">No expense data to display.</div>;
  }

  return (
    <div className="p-4 h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={110}
            fill="#8884d8" // Default fill, overridden by Cell
            dataKey="value1" // Data key should be value1
            nameKey="name"
            label={({ name, percent, fill }) => <text x={0} y={0} fill={fill === BRAND_COLORS_HEX.primary ? BRAND_COLORS_HEX.textOnPrimary : BRAND_COLORS_HEX.textOnSecondary } textAnchor="middle" dominantBaseline="central" className="text-xs">{`${name} (${(percent * 100).toFixed(0)}%)`}</text>}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Legend wrapperStyle={{ fontSize: "14px" }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};