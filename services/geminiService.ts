import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { HistoricalData, ForecastData, Budget, BudgetItem, ScenarioParams, ScenarioResult, ForecastPoint } from '../types';
import { MOCK_API_KEY } from '../constants';

// Initialize Gemini AI. API_KEY is expected to be in process.env
// For this frontend-only example, we'll use a mock key and simulate calls.

let ai: GoogleGenAI;
// Conditional initialization for browser vs. Node-like environment
// In a pure browser environment, process.env might not exist.
let apiKey = MOCK_API_KEY; // Default to mock key

if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
  apiKey = process.env.API_KEY;
} else {
  // console.warn("API_KEY not found in process.env. Using mock key for Gemini service in browser.");
  // No need to warn excessively in browser if mock is intended fallback
}

try {
  ai = new GoogleGenAI({ apiKey: apiKey });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI, ensure API_KEY is available or mock correctly:", error);
  // Fallback if instantiation fails
  ai = new GoogleGenAI({ apiKey: MOCK_API_KEY });
}


const SIMULATE_API_LATENCY = 1000; // ms

// Helper to simulate Gemini JSON response parsing
const parseGeminiJsonResponse = <T,>(textResponse: string): T | null => {
  let jsonStr = textResponse.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response from Gemini:", e, "Raw response:", textResponse);
    return null;
  }
};


export const generateRevenueForecast = async (historicalData: HistoricalData[]): Promise<ForecastData> => {
  const prompt = `Based on the following historical financial data: ${JSON.stringify(historicalData.slice(-12))}, forecast monthly revenue for the next 12 months. Include date (YYYY-MM-DD), value, confidenceMin (absolute value for deviation), and confidenceMax (absolute value for deviation). Return as JSON object with a "forecast" key containing an array of these points, and a "summary" key with a brief textual overview.`;

  // --- MOCKED API CALL (Actual call commented out) ---
  // console.log("Simulating Gemini API call for revenue forecast with prompt:", prompt);
  // const model = ai.models.generateContent({ model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" } });
  // const response: GenerateContentResponse = await model;
  // const parsed = parseGeminiJsonResponse<{ forecast: any[], summary: string }>(response.text);
  // if (parsed) return { type: 'revenue', points: parsed.forecast, summary: parsed.summary };
  // throw new Error("Failed to parse revenue forecast from Gemini");
  // --- END MOCKED API CALL ---
  
  return new Promise(resolve => {
    setTimeout(() => {
      const lastDate = historicalData.length > 0 ? new Date(historicalData[historicalData.length - 1].date) : new Date();
      const forecastPoints: ForecastPoint[] = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date(lastDate);
        date.setMonth(lastDate.getMonth() + i + 1);
        const baseValue = (historicalData.slice(-1)[0]?.revenue || 30000) * (1 + (Math.random() - 0.4) * 0.1); // Fluctuate around last revenue
        return {
          date: date.toISOString().split('T')[0],
          value: Math.max(0, parseFloat(baseValue.toFixed(0))),
          confidenceMin: parseFloat((baseValue * 0.1).toFixed(0)), // 10% deviation
          confidenceMax: parseFloat((baseValue * 0.1).toFixed(0)),
        };
      });
      resolve({
        type: 'revenue',
        points: forecastPoints,
        summary: 'Revenue is projected to show moderate growth over the next year, with seasonal peaks expected in Q2 and Q4.'
      });
    }, SIMULATE_API_LATENCY);
  });
};

export const generateExpenseForecast = async (historicalData: HistoricalData[]): Promise<ForecastData> => {
   // Similar prompt for expenses
  return new Promise(resolve => {
    setTimeout(() => {
      const lastDate = historicalData.length > 0 ? new Date(historicalData[historicalData.length - 1].date) : new Date();
      const forecastPoints: ForecastPoint[] = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date(lastDate);
        date.setMonth(lastDate.getMonth() + i + 1);
         const baseValue = (historicalData.slice(-1)[0]?.expenses || 15000) * (1 + (Math.random() - 0.45) * 0.05);
        return {
          date: date.toISOString().split('T')[0],
          value: Math.max(0, parseFloat(baseValue.toFixed(0))),
          confidenceMin: parseFloat((baseValue * 0.05).toFixed(0)),
          confidenceMax: parseFloat((baseValue * 0.05).toFixed(0)),
          category: ['Operations', 'Marketing', 'Salaries', 'Utilities', 'Software'][i % 5] // Mock categories for breakdown
        };
      });
      resolve({
        type: 'expenses',
        points: forecastPoints,
        summary: 'Expenses are expected to remain relatively stable, with slight increases in operational costs during peak business periods.'
      });
    }, SIMULATE_API_LATENCY);
  });
};

export const generateCashflowForecast = async (historicalData: HistoricalData[]): Promise<ForecastData> => {
  // Similar prompt for cashflow
  return new Promise(resolve => {
    setTimeout(() => {
      const lastDate = historicalData.length > 0 ? new Date(historicalData[historicalData.length - 1].date) : new Date();
      let lastCashflow = (historicalData.slice(-1)[0]?.revenue || 30000) - (historicalData.slice(-1)[0]?.expenses || 15000);
      const forecastPoints: ForecastPoint[] = Array.from({ length: 12 }).map((_, i) => {
        const date = new Date(lastDate);
        date.setMonth(lastDate.getMonth() + i + 1);
        lastCashflow = lastCashflow + (Math.random() * 10000 - 5000); // Simulate some cashflow change
        return {
          date: date.toISOString().split('T')[0],
          value: parseFloat(lastCashflow.toFixed(0)),
        };
      });
      resolve({
        type: 'cashflow',
        points: forecastPoints,
        summary: 'Cash flow is projected to be positive, with potential tightening in mid-year before improving towards year-end.'
      });
    }, SIMULATE_API_LATENCY);
  });
};

export const generateDraftBudget = async (historicalData: HistoricalData[], revenueForecast: ForecastData | null, expenseForecast: ForecastData | null): Promise<Budget> => {
  const prompt = `Given historical data: ${JSON.stringify(historicalData.slice(-6))}, revenue forecast: ${JSON.stringify(revenueForecast)}, and expense forecast: ${JSON.stringify(expenseForecast)}, generate a draft monthly budget for the upcoming month. Include categories like "Sales Revenue", "Service Revenue", "Marketing Expenses", "Operational Costs", "Salaries", "Utilities". Return as JSON object matching the Budget interface (id, name, period, items array with id, category, plannedAmount). Set actualAmount to 0.`;

  // --- MOCKED API CALL ---
  // const model = ai.models.generateContent({ model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" } });
  // const response: GenerateContentResponse = await model;
  // const parsed = parseGeminiJsonResponse<Budget>(response.text);
  // if (parsed) return parsed;
  // throw new Error("Failed to parse draft budget from Gemini");
  // --- END MOCKED API CALL ---
  
  return new Promise(resolve => {
    setTimeout(() => {
      const period = new Date(Date.now() + 30*24*60*60*1000).toLocaleString('default', { month: 'long', year: 'numeric' });
      const avgHistRevenue = historicalData.length > 0 ? historicalData.reduce((s,item)=>s+item.revenue,0)/historicalData.length : 35000;
      const avgHistExpenses = historicalData.length > 0 ? historicalData.reduce((s,item)=>s+item.expenses,0)/historicalData.length : 18000;

      const items: BudgetItem[] = [
        { id: 'cat1', category: 'Sales Revenue', plannedAmount: revenueForecast?.points[0]?.value || avgHistRevenue * 0.7, actualAmount: 0 },
        { id: 'cat2', category: 'Service Revenue', plannedAmount: revenueForecast?.points[1]?.value || avgHistRevenue * 0.3, actualAmount: 0 },
        { id: 'cat3', category: 'Marketing Expenses', plannedAmount: expenseForecast?.points.find(p=>p.category === 'Marketing')?.value || avgHistExpenses * 0.2, actualAmount: 0 },
        { id: 'cat4', category: 'Operational Costs', plannedAmount: expenseForecast?.points.find(p=>p.category === 'Operations')?.value || avgHistExpenses * 0.3, actualAmount: 0 },
        { id: 'cat5', category: 'Salaries', plannedAmount: expenseForecast?.points.find(p=>p.category === 'Salaries')?.value || avgHistExpenses * 0.4, actualAmount: 0 },
        { id: 'cat6', category: 'Utilities', plannedAmount: expenseForecast?.points.find(p=>p.category === 'Utilities')?.value || avgHistExpenses * 0.1, actualAmount: 0 },
      ];
      
      const draftBudget: Budget = {
        id: Date.now().toString(),
        name: `Draft Budget - ${period}`,
        period: period,
        items: items,
        totalPlanned: 0, // Will be calculated
        totalActual: 0,
      };
      // Correct totalPlanned: sum of expense categories
      draftBudget.totalPlanned = draftBudget.items
        .filter(item => !item.category.toLowerCase().includes('revenue')) 
        .reduce((sum, item) => sum + item.plannedAmount, 0);
      // Actual total actual is 0 initially. Variance can be calculated in UI or later.

      resolve(draftBudget);
    }, SIMULATE_API_LATENCY);
  });
};

export const analyzeWhatIfScenario = async (budget: Budget, params: ScenarioParams): Promise<ScenarioResult> => {
  const prompt = `Analyze the impact of the following scenario on the current budget (${JSON.stringify(budget)}). Scenario parameters: ${JSON.stringify(params)}. Provide an "impactSummary" (text), "projectedRevenue", "projectedExpenses", and "projectedCashflow". Return as JSON.`;
  
  // --- MOCKED API CALL ---
  // const model = ai.models.generateContent({ model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" } });
  // const response: GenerateContentResponse = await model;
  // const parsed = parseGeminiJsonResponse<Omit<ScenarioResult, 'scenarioId'>>(response.text);
  // if (parsed) return { scenarioId: Date.now().toString(), ...parsed }; // scenarioId would be linked to the scenario triggering this
  // throw new Error("Failed to parse scenario analysis from Gemini");
  // --- END MOCKED API CALL ---

  return new Promise(resolve => {
    setTimeout(() => {
      let revenueItemsValue = budget.items.filter(i => i.category.toLowerCase().includes('revenue')).reduce((s, item) => s + item.plannedAmount, 0);
      let expenseItemsValue = budget.items.filter(i => !i.category.toLowerCase().includes('revenue')).reduce((s, item) => s + item.plannedAmount, 0);

      let projectedRevenue = revenueItemsValue;
      let projectedExpenses = expenseItemsValue;

      if (params.revenueChangePercent) {
        projectedRevenue *= (1 + params.revenueChangePercent);
      }
      if (params.expenseChangePercent) {
        projectedExpenses *= (1 + params.expenseChangePercent);
      }
      if (params.oneTimeExpense) {
        projectedExpenses += params.oneTimeExpense.amount;
      }
      if (params.oneTimeRevenue) {
        projectedRevenue += params.oneTimeRevenue.amount;
      }
      
      const projectedCashflow = projectedRevenue - projectedExpenses;
      const baseCashflow = revenueItemsValue - expenseItemsValue;
      const percentageChange = baseCashflow !== 0 ? (((projectedCashflow / baseCashflow) -1 ) * 100) : (projectedCashflow > 0 ? Infinity : -Infinity) ;

      resolve({
        scenarioId: Date.now().toString(), // This should match the triggering scenario's ID
        impactSummary: `Scenario projects revenue of $${projectedRevenue.toLocaleString()} and expenses of $${projectedExpenses.toLocaleString()}, resulting in cashflow of $${projectedCashflow.toLocaleString()}. This is a change of ${isFinite(percentageChange) ? percentageChange.toFixed(1) + '%' : 'a significant amount' } from base budget cashflow.`,
        projectedRevenue: parseFloat(projectedRevenue.toFixed(0)),
        projectedExpenses: parseFloat(projectedExpenses.toFixed(0)),
        projectedCashflow: parseFloat(projectedCashflow.toFixed(0)),
      });
    }, SIMULATE_API_LATENCY);
  });
};

export const getBudgetRecommendations = async (budget: Budget | null): Promise<string[]> => {
  if (!budget) return Promise.resolve(["Create or import a budget to get personalized recommendations."]);
  const prompt = `Based on the current budget: ${JSON.stringify(budget)}, provide 3-5 actionable recommendations for optimization or risk mitigation. Focus on areas like cost-saving, revenue enhancement, or cash flow improvement. Return as a JSON array of strings.`;

  // --- MOCKED API CALL ---
  // const model = ai.models.generateContent({ model: "gemini-2.5-flash-preview-04-17", contents: prompt, config: { responseMimeType: "application/json" } });
  // const response: GenerateContentResponse = await model;
  // const parsed = parseGeminiJsonResponse<string[]>(response.text);
  // if (parsed) return parsed;
  // throw new Error("Failed to parse recommendations from Gemini");
  // --- END MOCKED API CALL ---

  return new Promise(resolve => {
    setTimeout(() => {
      const marketingExpenseItem = budget.items.find(i=>i.category === 'Marketing Expenses');
      const recommendations = [
        "Consider renegotiating supplier contracts for operational costs to potentially reduce expenses by 5-10%.",
        "Explore targeted marketing campaigns for high-margin services/products to boost revenue.",
        `Review discretionary spending in categories like 'Marketing Expenses'. Current planned amount is $${(marketingExpenseItem?.plannedAmount || 0).toLocaleString()}.`,
        "Implement a tiered pricing strategy to capture a wider customer base and increase average revenue per user.",
        "Monitor cash flow closely for the next quarter and maintain a contingency fund of at least 15% of monthly operating expenses."
      ];
      resolve(recommendations.slice(0, Math.floor(Math.random() * 3) + 3)); // Random 3-5 recs
    }, SIMULATE_API_LATENCY / 2);
  });
};
