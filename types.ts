export type View = 'DASHBOARD' | 'DATA_IMPORT' | 'BUDGET_PLANNER' | 'SCENARIO_ANALYSIS' | 'ALERTS_RECOMMENDATIONS';

export interface NavItem {
  name: string;
  view: View;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

export interface HistoricalData {
  id: string;
  date: string; // YYYY-MM-DD
  revenue: number;
  expenses: number;
  category?: string; // Optional: for expense categorization
  description?: string;
}

export interface ForecastPoint {
  date: string; // YYYY-MM-DD or YYYY-MM
  value: number;
  confidenceMin?: number; // Absolute deviation
  confidenceMax?: number; // Absolute deviation
  category?: string; // Optional: for expense categorization in forecasts
}

export interface ForecastData {
  type: 'revenue' | 'expenses' | 'cashflow';
  points: ForecastPoint[];
  summary?: string; // AI generated summary
}

export interface BudgetItem {
  id: string;
  category: string;
  plannedAmount: number;
  actualAmount: number; // Initially 0 or based on historicals
  variance?: number; // Calculated: planned - actual
}

export interface Budget {
  id: string;
  name: string;
  period: string; // e.g., "Monthly - 2024-07" or "Quarterly - Q3 2024"
  items: BudgetItem[];
  totalPlanned: number;
  totalActual: number;
  totalVariance?: number;
}

export interface ScenarioParams {
  revenueChangePercent?: number; // e.g., 0.1 for +10%, -0.2 for -20%
  expenseChangePercent?: number;
  oneTimeExpense?: { amount: number; description: string };
  oneTimeRevenue?: { amount: number; description: string };
  customPrompt?: string; // For more complex scenarios
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  params: ScenarioParams;
}

export interface ScenarioResult {
  scenarioId: string;
  impactSummary: string;
  projectedRevenue?: number;
  projectedExpenses?: number;
  projectedCashflow?: number;
  affectedBudgetItems?: BudgetItem[]; // Optional: show specific items affected
}

export interface Alert {
  id: string;
  type: 'overrun' | 'anomaly' | 'shortfall' | 'info' | 'warning' | 'error';
  message: string;
  date: string; // ISO date string
  severity: 'info' | 'warning' | 'error';
  relatedItem?: string; // e.g., Budget category ID
}

export interface ChartDataItem {
  name: string; // Typically date or category string for display
  value1?: number; // e.g., Actual / Historical
  value2?: number; // e.g., Forecasted/Planned
  value3?: number; // e.g., Confidence Min Bound / Lower value for range
  value4?: number; // e.g., Confidence Max Bound / Upper value for range
}