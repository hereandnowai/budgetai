
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ForecastData, ChartDataItem } from '../../types';
import { BRAND_COLORS_HEX } from '../../constants';

interface CashflowProjectionChartProps {
  forecastData: ForecastData;
}

export const CashflowProjectionChart: React.FC<CashflowProjectionChartProps> = ({ forecastData }) => {
  const chartData: ChartDataItem[] = forecastData.points.map(point => ({
    name: new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    value1: point.value, // Projected Cash Flow
  }));

  return (
    <div className="p-4 h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          <Bar dataKey="value1" name="Projected Cash Flow" fill={BRAND_COLORS_HEX.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};