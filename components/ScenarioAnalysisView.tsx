
import React, { useState } from 'react';
import { Budget, Scenario, ScenarioParams, ScenarioResult } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Table } from './ui/Table';
import { BeakerIcon, LightBulbIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface ScenarioAnalysisViewProps {
  budget: Budget | null;
  scenarios: Scenario[];
  scenarioResults: ScenarioResult[];
  onRunScenario: (scenario: Scenario) => Promise<void>;
  isLoading: boolean;
}

const initialScenarioParams: ScenarioParams = {
  revenueChangePercent: 0,
  expenseChangePercent: 0,
};

export const ScenarioAnalysisView: React.FC<ScenarioAnalysisViewProps> = ({ budget, scenarios, scenarioResults, onRunScenario, isLoading }) => {
  const [scenarioName, setScenarioName] = useState<string>('');
  const [scenarioDescription, setScenarioDescription] = useState<string>('');
  const [currentParams, setCurrentParams] = useState<ScenarioParams>(initialScenarioParams);

  const handleParamChange = (field: keyof ScenarioParams, value: string | number) => {
    setCurrentParams(prev => ({ ...prev, [field]: parseFloat(value as string) || 0 }));
  };

  const handleRunNewScenario = () => {
    if (!budget) {
      alert("Please create or select a budget first.");
      return;
    }
    if (!scenarioName.trim()) {
      alert("Please provide a name for the scenario.");
      return;
    }
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: scenarioName,
      description: scenarioDescription || `Revenue ${currentParams.revenueChangePercent ? (currentParams.revenueChangePercent * 100).toFixed(0) + '%' : 'no change'}, Expenses ${currentParams.expenseChangePercent ? (currentParams.expenseChangePercent * 100).toFixed(0) + '%' : 'no change'}`,
      params: { ...currentParams },
    };
    onRunScenario(newScenario).then(() => {
        setScenarioName('');
        setScenarioDescription('');
        setCurrentParams(initialScenarioParams);
    });
  };

  const scenarioColumns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Description', accessor: 'description' },
    { Header: 'Impact Summary', accessor: 'impactSummary' },
    { Header: 'Projected Revenue', accessor: 'projectedRevenue' },
    { Header: 'Projected Expenses', accessor: 'projectedExpenses' },
  ];

  const scenarioTableData = scenarios.map(s => {
    const result = scenarioResults.find(r => r.scenarioId === s.id);
    return {
      name: s.name,
      description: s.description,
      impactSummary: result?.impactSummary || 'N/A',
      projectedRevenue: result?.projectedRevenue?.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) || 'N/A',
      projectedExpenses: result?.projectedExpenses?.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) || 'N/A',
    };
  });

  if (!budget && !isLoading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <BeakerIcon className="h-16 w-16 text-brandPrimary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Scenario Analysis</h2>
          <p className="text-gray-500">
            Create or select an active budget to start running "what-if" scenarios.
          </p>
        </div>
      </Card>
    );
  }
  
  if (isLoading && scenarios.length === 0) {
      return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg"/></div>
  }


  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Define New Scenario</h2>
          <p className="text-sm text-gray-500 mb-4">Test different financial outcomes based on your current budget ({budget?.name || 'No Budget Active'}).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="Scenario Name" type="text" value={scenarioName} onChange={(e) => setScenarioName(e.target.value)} placeholder="e.g., Aggressive Growth" />
            <Input label="Description (Optional)" type="text" value={scenarioDescription} onChange={(e) => setScenarioDescription(e.target.value)} placeholder="e.g., Assumes 20% revenue increase and 10% marketing spend increase" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input label="Revenue Change (%)" type="number" step="1" value={(currentParams.revenueChangePercent || 0) * 100} onChange={(e) => handleParamChange('revenueChangePercent', parseFloat(e.target.value) / 100)} placeholder="e.g., 20 for +20%, -10 for -10%" />
            <Input label="Overall Expense Change (%)" type="number" step="1" value={(currentParams.expenseChangePercent || 0) * 100} onChange={(e) => handleParamChange('expenseChangePercent', parseFloat(e.target.value) / 100)} placeholder="e.g., 5 for +5%, -2 for -2%" />
             {/* Add more specific params if needed: oneTimeExpense, oneTimeRevenue, customPrompt */}
          </div>
          <Button onClick={handleRunNewScenario} variant="primary" disabled={isLoading || !budget}>
            {isLoading ? <LoadingSpinner size="sm"/> : <PlusCircleIcon className="h-5 w-5 mr-2"/>}
            {isLoading ? 'Analyzing...' : 'Run New Scenario'}
          </Button>
           {!budget && <p className="text-red-500 text-sm mt-2">An active budget is required to run scenarios.</p>}
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Scenario Results</h2>
          {scenarios.length > 0 ? (
            <Table columns={scenarioColumns} data={scenarioTableData} />
          ) : (
             <div className="text-center py-8">
                <LightBulbIcon className="h-12 w-12 text-brandPrimary mx-auto mb-3" />
                <p className="text-gray-600">No scenarios run yet. Define and run a scenario above to see results.</p>
             </div>
          )}
        </div>
      </Card>
    </div>
  );
};