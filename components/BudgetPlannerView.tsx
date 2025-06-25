import React, { useState, useEffect, useCallback } from 'react';
import { Budget, BudgetItem, HistoricalData, ForecastData } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Table } from './ui/Table';
import { PlusCircleIcon, TrashIcon, DocumentDuplicateIcon, CalculatorIcon, PencilIcon } from '@heroicons/react/24/outline';
import { generateDraftBudget } from '../services/geminiService';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface BudgetPlannerViewProps {
  budget: Budget | null;
  setBudget: (budget: Budget | null) => void;
  historicalData: HistoricalData[];
  revenueForecast: ForecastData | null;
  expenseForecast: ForecastData | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const initialBudgetItem: Omit<BudgetItem, 'id'> = { category: '', plannedAmount: 0, actualAmount: 0 };

export const BudgetPlannerView: React.FC<BudgetPlannerViewProps> = ({ budget, setBudget, historicalData, revenueForecast, expenseForecast, isLoading, setIsLoading }) => {
  const [currentBudgetState, setCurrentBudgetState] = useState<Budget | null>(budget);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  
  // Initialize budgetName and budgetPeriod from currentBudgetState or defaults
  const [budgetName, setBudgetNameState] = useState<string>(budget?.name || 'New Budget');
  const [budgetPeriod, setBudgetPeriodState] = useState<string>(budget?.period || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

  useEffect(() => {
    setCurrentBudgetState(budget);
    if (budget) {
      setBudgetNameState(budget.name);
      setBudgetPeriodState(budget.period);
    } else {
      // Reset to defaults if budget becomes null
      setBudgetNameState('New Budget');
      setBudgetPeriodState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
    }
  }, [budget]);

  const updateParentAndLocalBudget = (newBudget: Budget | null) => {
    setCurrentBudgetState(newBudget);
    setBudget(newBudget);
    if (newBudget) {
      setBudgetNameState(newBudget.name);
      setBudgetPeriodState(newBudget.period);
    }
  };
  
  const handleCreateNewBudget = useCallback(() => {
    const newBudgetId = Date.now().toString();
    const newBudget: Budget = {
      id: newBudgetId,
      name: 'Untitled Budget',
      period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      items: [
        { id: Date.now().toString() + '1', category: 'Revenue Example', plannedAmount: 50000, actualAmount: 0 },
        { id: Date.now().toString() + '2', category: 'Marketing Expenses', plannedAmount: 5000, actualAmount: 0 },
        { id: Date.now().toString() + '3', category: 'Operational Costs', plannedAmount: 10000, actualAmount: 0 },
      ],
      totalPlanned: 15000, // Sum of expenses
      totalActual: 0,
      totalVariance: 15000,
    };
    updateParentAndLocalBudget(newBudget);
  }, [setBudget]); // updateParentAndLocalBudget is not memoized, but setBudget is stable

  const handleGenerateDraft = useCallback(async () => {
    if (historicalData.length === 0 && !revenueForecast && !expenseForecast) {
      alert("Please import data or ensure forecasts are available to generate a draft budget.");
      return;
    }
    setIsLoading(true);
    try {
      const draftBudget = await generateDraftBudget(historicalData, revenueForecast, expenseForecast);
      updateParentAndLocalBudget(draftBudget);
    } catch (err) { // Changed 'error' to 'err' to avoid conflict with Error constructor
      console.error("Failed to generate draft budget:", err);
      alert("Error generating draft budget. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [historicalData, revenueForecast, expenseForecast, setIsLoading, setBudget]); // updateParentAndLocalBudget dep removed for simplicity / stability of setBudget

  const calculateBudgetTotals = (items: BudgetItem[]): Pick<Budget, 'totalPlanned' | 'totalActual' | 'totalVariance'> => {
    const totalPlanned = items
      .filter(item => !item.category.toLowerCase().includes('revenue')) // Sum only expenses for "Total Planned Expenses"
      .reduce((sum, item) => sum + Number(item.plannedAmount), 0);
    const totalActual = items
      .filter(item => !item.category.toLowerCase().includes('revenue')) // Sum only actual expenses
      .reduce((sum, item) => sum + Number(item.actualAmount), 0);
    return { totalPlanned, totalActual, totalVariance: totalPlanned - totalActual };
  };

  const handleItemChange = (index: number, field: keyof BudgetItem, value: string | number) => {
    if (!currentBudgetState) return;
    const updatedItems = currentBudgetState.items.map((item, i) => {
      if (i === index) {
        const numericValue = (field === 'plannedAmount' || field === 'actualAmount') 
          ? (typeof value === 'string' ? parseFloat(value) || 0 : value) 
          : value;
        return { ...item, [field]: numericValue };
      }
      return item;
    });
    const totals = calculateBudgetTotals(updatedItems);
    const newBudget: Budget = { ...currentBudgetState, items: updatedItems, ...totals };
    updateParentAndLocalBudget(newBudget);
  };

  const addItem = () => {
    if (!currentBudgetState) return;
    const newItem: BudgetItem = { ...initialBudgetItem, id: Date.now().toString() };
    const updatedItems = [...currentBudgetState.items, newItem];
    const totals = calculateBudgetTotals(updatedItems);
    const newBudget: Budget = { ...currentBudgetState, items: updatedItems, ...totals };
    updateParentAndLocalBudget(newBudget);
  };

  const removeItem = (index: number) => {
    if (!currentBudgetState) return;
    const updatedItems = currentBudgetState.items.filter((_, i) => i !== index);
    const totals = calculateBudgetTotals(updatedItems);
    const newBudget: Budget = { ...currentBudgetState, items: updatedItems, ...totals };
    updateParentAndLocalBudget(newBudget);
  };
  
  const handleSaveBudgetNamePeriod = () => {
    if (currentBudgetState) {
      const updatedBudget: Budget = {...currentBudgetState, name: budgetName, period: budgetPeriod };
      updateParentAndLocalBudget(updatedBudget);
    }
    setIsEditingName(false);
  };

  const columns = [
    { Header: 'Category', accessor: 'category' },
    { Header: 'Planned Amount ($)', accessor: 'plannedAmount' },
    { Header: 'Actual Amount ($)', accessor: 'actualAmount' },
    { Header: 'Variance ($)', accessor: 'variance' },
    { Header: 'Actions', accessor: 'actions' },
  ];

  if (!currentBudgetState && !isLoading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <CalculatorIcon className="h-16 w-16 text-brandPrimary mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-3">No Budget Selected</h2>
          <p className="text-gray-600 mb-6">Create a new budget or generate a draft from your financial data.</p>
          <div className="space-x-3">
            <Button onClick={handleCreateNewBudget} variant="primary">
              <PlusCircleIcon className="h-5 w-5 mr-2"/> Create New Budget
            </Button>
            <Button onClick={handleGenerateDraft} variant="secondary" disabled={isLoading || (historicalData.length === 0 && !revenueForecast && !expenseForecast)}>
             <DocumentDuplicateIcon className="h-5 w-5 mr-2"/> Generate Draft Budget
            </Button>
          </div>
        </div>
      </Card>
    );
  }
  
  if (isLoading && !currentBudgetState) {
     return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  }
  
  if (!currentBudgetState) return null; // Should be covered by above, but as a safeguard
  
  const inputStyling = "bg-gray-700 text-gray-100 placeholder:text-gray-400 border-gray-600";

  const tableData = currentBudgetState.items.map((item, index) => ({
    ...item, // Spread item to ensure all original properties are there for the table
    category: <Input type="text" value={item.category} onChange={(e) => handleItemChange(index, 'category', e.target.value)} placeholder="Category Name" className={`w-full min-w-[150px] ${inputStyling}`} />,
    plannedAmount: <Input type="number" value={item.plannedAmount} onChange={(e) => handleItemChange(index, 'plannedAmount', e.target.value)} className={`w-full min-w-[100px] ${inputStyling}`} />,
    actualAmount: <Input type="number" value={item.actualAmount} onChange={(e) => handleItemChange(index, 'actualAmount', e.target.value)} className={`w-full min-w-[100px] ${inputStyling}`} />, // Allow editing actuals for manual input
    variance: (item.plannedAmount - item.actualAmount).toLocaleString(),
    actions: <Button onClick={() => removeItem(index)} variant="danger" size="sm" aria-label="Remove item"><TrashIcon className="h-4 w-4"/></Button>
  }));

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          {isEditingName ? (
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
              <Input label="Budget Name" type="text" value={budgetName} onChange={(e) => setBudgetNameState(e.target.value)} className="text-xl font-semibold flex-grow w-full sm:w-auto" wrapperClassName="flex-grow w-full sm:w-auto" />
              <Input label="Budget Period" type="text" value={budgetPeriod} onChange={(e) => setBudgetPeriodState(e.target.value)} className="text-base flex-grow w-full sm:w-auto" wrapperClassName="flex-grow w-full sm:w-auto" />
              <Button onClick={handleSaveBudgetNamePeriod} variant="primary" size="sm" className="mt-2 sm:mt-0 self-end">Save</Button>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 ">{currentBudgetState.name}</h2>
                    <p className="text-sm text-gray-500 ">{currentBudgetState.period}</p>
                </div>
              <Button onClick={() => setIsEditingName(true)} variant="ghost" size="sm">
                <PencilIcon className="h-4 w-4 mr-1 text-brandSecondary"/> Edit Name/Period
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
            <h3 className="text-xl font-medium text-gray-700">Budget Items</h3>
            <div className="space-x-2 flex items-center">
                <Button onClick={handleGenerateDraft} variant="secondary" size="sm" disabled={isLoading || (historicalData.length === 0 && !revenueForecast && !expenseForecast)}>
                    {isLoading && !currentBudgetState ? <LoadingSpinner size="sm" /> : <DocumentDuplicateIcon className="h-5 w-5 mr-1" />}
                    {isLoading && !currentBudgetState ? 'Generating...' : 'Regenerate Draft'}
                </Button>
                <Button onClick={addItem} variant="primary" size="sm">
                <PlusCircleIcon className="h-5 w-5 mr-1"/> Add Item
                </Button>
            </div>
          </div>
          
          <Table columns={columns} data={tableData} />

          <div className="mt-6 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right">
              <div>
                <p className="text-gray-500 text-sm">Total Planned (Expenses)</p>
                <p className="text-xl font-semibold">${currentBudgetState.totalPlanned.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Actual (Expenses)</p>
                <p className="text-xl font-semibold">${currentBudgetState.totalActual.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Variance</p>
                <p className={`text-xl font-semibold ${ (currentBudgetState.totalVariance !== undefined && currentBudgetState.totalVariance >= 0) ? 'text-green-600' : 'text-red-600'}`}>
                  ${(currentBudgetState.totalVariance || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
