
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { ForecastData, HistoricalData, ChartDataItem, ForecastPoint } from '../../types';
import { BRAND_COLORS_HEX } from '../../constants';

interface RevenueForecastChartProps {
  forecastData: ForecastData;
  historicalData: HistoricalData[];
}

interface CombinedRawDataPoint {
  date: Date;
  revenue?: number;
  forecastValue?: number;
  forecastConfidenceMin?: number; // These are deviations
  forecastConfidenceMax?: number; // These are deviations
}

export const RevenueForecastChart: React.FC<RevenueForecastChartProps> = ({ forecastData, historicalData }) => {
  
  const combinedRawData: CombinedRawDataPoint[] = [
    ...historicalData.map(item => ({
      date: new Date(item.date),
      revenue: item.revenue,
    })),
    ...forecastData.points.map(point => ({
      date: new Date(point.date),
      forecastValue: point.value,
      forecastConfidenceMin: point.confidenceMin,
      forecastConfidenceMax: point.confidenceMax,
    }))
  ];

  // Sort by date to ensure correct order before merging/displaying
  combinedRawData.sort((a, b) => a.date.getTime() - b.date.getTime());

  const dataMap = new Map<string, ChartDataItem>();

  combinedRawData.forEach(rawPoint => {
    const name = rawPoint.date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    
    // Initialize current item's potential values
    let value1: number | undefined = undefined;
    let value2: number | undefined = undefined;
    let value3: number | undefined = undefined; // Lower bound
    let value4: number | undefined = undefined; // Upper bound

    if (rawPoint.revenue !== undefined) {
      value1 = rawPoint.revenue;
    }
    if (rawPoint.forecastValue !== undefined) {
      value2 = rawPoint.forecastValue;
      if (rawPoint.forecastConfidenceMin !== undefined) {
        value3 = rawPoint.forecastValue - rawPoint.forecastConfidenceMin;
      }
      if (rawPoint.forecastConfidenceMax !== undefined) {
        value4 = rawPoint.forecastValue + rawPoint.forecastConfidenceMax;
      }
    }
    
    const existingChartItem = dataMap.get(name);
    if (existingChartItem) {
      // Merge: prioritize defined values from current rawPoint
      dataMap.set(name, { 
        name, // name is the key, already matches
        value1: value1 !== undefined ? value1 : existingChartItem.value1,
        value2: value2 !== undefined ? value2 : existingChartItem.value2,
        value3: value3 !== undefined ? value3 : existingChartItem.value3,
        value4: value4 !== undefined ? value4 : existingChartItem.value4,
      });
    } else {
      dataMap.set(name, { name, value1, value2, value3, value4 });
    }
  });

  const uniqueChartData: ChartDataItem[] = Array.from(dataMap.values());
  // The uniqueChartData is already sorted because we iterated over sorted combinedRawData and Map preserves insertion order for string keys.

  const hasConfidenceInterval = forecastData.points.some(p => p.confidenceMin !== undefined && p.confidenceMax !== undefined);

  return (
    <div className="p-4 h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={uniqueChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} allowDataOverflow={false}/>
          <Tooltip formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()}`, props.payload?.name === name ? name : props.name ]} />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          <Line type="monotone" dataKey="value1" name="Actual Revenue" stroke={BRAND_COLORS_HEX.secondary} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
          <Line type="monotone" dataKey="value2" name="Forecasted Revenue" stroke={BRAND_COLORS_HEX.primary} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: BRAND_COLORS_HEX.primary }} activeDot={{ r: 6, fill: BRAND_COLORS_HEX.primary }} connectNulls={false} />
          
          {hasConfidenceInterval && (
            <Area 
              type="monotone" 
              dataKey="value4" // Upper bound
              name="Confidence Interval Upper" 
              fill={BRAND_COLORS_HEX.primary} 
              fillOpacity={0.1} 
              stroke="transparent" 
              stackId="confidence" 
              legendType="none"
              connectNulls={false}
            />
          )}
           {hasConfidenceInterval && (
             <Area 
              type="monotone" 
              dataKey="value3" // Lower bound
              name="Confidence Interval Lower" 
              fill={BRAND_COLORS_HEX.primary} 
              fillOpacity={0.1}
              stroke="transparent" 
              stackId="confidence" 
              legendType="none"
              connectNulls={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};