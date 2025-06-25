
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { DataImportView } from './components/DataImportView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { ScenarioAnalysisView } from './components/ScenarioAnalysisView';
import { AlertsRecommendationsView } from './components/AlertsRecommendationsView';
import { View, HistoricalData, Budget, Alert, ForecastData, Scenario, ScenarioResult } from './types';
import { generateRevenueForecast, generateExpenseForecast, generateCashflowForecast, getBudgetRecommendations, analyzeWhatIfScenario } from './services/geminiService';
import { VIEW_DASHBOARD } from './constants'; // Default view

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(VIEW_DASHBOARD);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  const [revenueForecast, setRevenueForecast] = useState<ForecastData | null>(null);
  const [expenseForecast, setExpenseForecast] = useState<ForecastData | null>(null);
  const [cashflowForecast, setCashflowForecast] = useState<ForecastData | null>(null);
  
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadInitialData = useCallback(async () => {
    if (historicalData.length > 0) {
      setIsLoading(true);
      try {
        const [revForecast, expForecast, cfForecast, recs] = await Promise.all([
          generateRevenueForecast(historicalData),
          generateExpenseForecast(historicalData),
          generateCashflowForecast(historicalData),
          getBudgetRecommendations(budget)
        ]);
        setRevenueForecast(revForecast);
        setExpenseForecast(expForecast);
        setCashflowForecast(cfForecast);
        setRecommendations(recs);

        // Mock alerts
        setAlerts([
          { id: '1', type: 'info', message: 'Welcome to BudgetAI! Consider importing your latest financials.', date: new Date().toISOString(), severity: 'info' },
        ]);
        
      } catch (error) {
        console.error("Error loading initial data:", error);
        setAlerts(prev => [...prev, {id: Date.now().toString(), type: 'error', message: 'Failed to load initial forecast data.', date: new Date().toISOString(), severity: 'error'}]);
      } finally {
        setIsLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historicalData, budget]); // Add budget if recommendations depend on it

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleDataImported = (data: HistoricalData[]) => {
    setHistoricalData(data);
    setCurrentView(VIEW_DASHBOARD); // Switch to dashboard after import
    // Trigger forecast update
    if (data.length > 0) {
        loadInitialData();
    }
  };

  const handleRunScenario = async (scenario: Scenario) => {
    if (!budget) {
      setAlerts(prev => [...prev, {id: Date.now().toString(), type: 'warning', message: 'Please create a budget before running scenarios.', date: new Date().toISOString(), severity: 'warning'}]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await analyzeWhatIfScenario(budget, scenario.params);
      setScenarios(prev => [...prev, scenario]);
      setScenarioResults(prev => [...prev, result]);
      setAlerts(prev => [...prev, {id: Date.now().toString(), type: 'info', message: `Scenario "${scenario.name}" analyzed.`, date: new Date().toISOString(), severity: 'info'}]);
    } catch (error) {
      console.error("Error running scenario:", error);
      setAlerts(prev => [...prev, {id: Date.now().toString(), type: 'error', message: `Failed to analyze scenario "${scenario.name}".`, date: new Date().toISOString(), severity: 'error'}]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <DashboardView 
                  historicalData={historicalData}
                  revenueForecast={revenueForecast}
                  expenseForecast={expenseForecast}
                  cashflowForecast={cashflowForecast}
                  budget={budget}
                  isLoading={isLoading} 
                />;
      case 'DATA_IMPORT':
        return <DataImportView onDataImported={handleDataImported} />;
      case 'BUDGET_PLANNER':
        return <BudgetPlannerView 
                  budget={budget} 
                  setBudget={setBudget} 
                  historicalData={historicalData} 
                  revenueForecast={revenueForecast}
                  expenseForecast={expenseForecast}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />;
      case 'SCENARIO_ANALYSIS':
        return <ScenarioAnalysisView 
                  budget={budget} 
                  scenarios={scenarios} 
                  scenarioResults={scenarioResults} 
                  onRunScenario={handleRunScenario} 
                  isLoading={isLoading}
                />;
      case 'ALERTS_RECOMMENDATIONS':
        return <AlertsRecommendationsView alerts={alerts} recommendations={recommendations} isLoading={isLoading} />;
      default:
        return <DashboardView 
                  historicalData={historicalData}
                  revenueForecast={revenueForecast}
                  expenseForecast={expenseForecast}
                  cashflowForecast={cashflowForecast}
                  budget={budget} 
                  isLoading={isLoading}
                />;
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
