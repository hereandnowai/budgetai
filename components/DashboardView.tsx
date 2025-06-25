
import React from 'react';
import { HistoricalData, ForecastData, Budget } from '../types';
import { Card } from './ui/Card';
import { RevenueForecastChart } from './charts/RevenueForecastChart';
import { ExpenseBreakdownChart } from './charts/ExpenseBreakdownChart';
import { CashflowProjectionChart } from './charts/CashflowProjectionChart';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { APP_NAME } from '../constants';

interface DashboardViewProps {
  historicalData: HistoricalData[];
  revenueForecast: ForecastData | null;
  expenseForecast: ForecastData | null;
  cashflowForecast: ForecastData | null;
  budget: Budget | null;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  historicalData, revenueForecast, expenseForecast, cashflowForecast, budget, isLoading 
}) => {
  
  const totalRevenue = historicalData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = historicalData.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  if (isLoading && historicalData.length > 0) { // Only show global loading if data is expected
    return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  }
  
  if (historicalData.length === 0 && !isLoading) {
     return (
      <Card>
        <div className="text-center p-8">
          <PresentationChartLineIcon className="h-16 w-16 text-brandPrimary mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to {APP_NAME} Dashboard</h3>
          <p className="text-gray-500">
            Please import your financial data to get started with forecasts and budgeting.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-500">Total Revenue (Hist.)</h4>
              <ArrowUpIcon className="h-5 w-5 text-green-500" /> {/* Semantic color */}
            </div>
            <p className="text-2xl font-semibold text-gray-800 mt-1">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-500">Total Expenses (Hist.)</h4>
              <ArrowDownIcon className="h-5 w-5 text-red-500" /> {/* Semantic color */}
            </div>
            <p className="text-2xl font-semibold text-gray-800 mt-1">
              ${totalExpenses.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-500">Net Profit (Hist.)</h4>
              <CurrencyDollarIcon className={`h-5 w-5 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} /> {/* Semantic color */}
            </div>
            <p className="text-2xl font-semibold text-gray-800 mt-1">
              ${netProfit.toLocaleString()}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-500">Budget Status</h4>
            <p className="text-2xl font-semibold text-gray-800 mt-1">
              {budget ? `${budget.name} (${budget.period})` : 'No Active Budget'}
            </p>
             {budget && <p className="text-xs text-gray-500">Planned: ${budget.totalPlanned.toLocaleString()}</p>}
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 p-4 border-b">Revenue Forecast</h3>
          {revenueForecast ? <RevenueForecastChart forecastData={revenueForecast} historicalData={historicalData} /> : <div className="p-4 text-gray-500">No revenue forecast data available.</div>}
        </Card>
        <Card>
          <h3 className="text-lg font-semibold text-gray-700 p-4 border-b">Expense Breakdown (Forecasted)</h3>
          {expenseForecast ? <ExpenseBreakdownChart forecastData={expenseForecast} /> : <div className="p-4 text-gray-500">No expense forecast data available.</div>}
        </Card>
      </div>
      <Card>
        <h3 className="text-lg font-semibold text-gray-700 p-4 border-b">Cash Flow Projection</h3>
        {cashflowForecast ? <CashflowProjectionChart forecastData={cashflowForecast} /> : <div className="p-4 text-gray-500">No cash flow projection data available.</div>}
      </Card>
    </div>
  );
};