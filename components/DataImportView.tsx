
import React, { useState, useCallback } from 'react';
import { HistoricalData } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { ArrowUpTrayIcon, DocumentTextIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface DataImportViewProps {
  onDataImported: (data: HistoricalData[]) => void;
}

// Sample data to simulate import
const sampleHistoricalData: HistoricalData[] = [
  { id: '1', date: '2023-01-15', revenue: 25000, expenses: 15000, category: 'Consulting', description: 'Project Alpha' },
  { id: '2', date: '2023-02-15', revenue: 28000, expenses: 16000, category: 'Software Sales', description: 'New Client Deals' },
  { id: '3', date: '2023-03-15', revenue: 22000, expenses: 14000, category: 'Maintenance', description: 'Recurring Support' },
  { id: '4', date: '2023-04-15', revenue: 30000, expenses: 17000, category: 'Consulting', description: 'Project Beta' },
  { id: '5', date: '2023-05-15', revenue: 32000, expenses: 18000, category: 'Software Sales', description: 'Upsells' },
  { id: '6', date: '2023-06-15', revenue: 27000, expenses: 15500, category: 'Maintenance', description: 'Quarterly Review' },
  { id: '7', date: '2023-07-15', revenue: 35000, expenses: 19000, category: 'Consulting', description: 'New Retainer' },
  { id: '8', date: '2023-08-15', revenue: 33000, expenses: 18500, category: 'Software Sales', description: 'Existing Clients Growth' },
  { id: '9', date: '2023-09-15', revenue: 29000, expenses: 16500, category: 'Maintenance', description: 'Annual Contracts' },
  { id: '10', date: '2023-10-15', revenue: 38000, expenses: 20000, category: 'Consulting', description: 'Project Gamma' },
  { id: '11', date: '2023-11-15', revenue: 36000, expenses: 19500, category: 'Software Sales', description: 'Holiday Deals' },
  { id: '12', date: '2023-12-15', revenue: 31000, expenses: 17500, category: 'Maintenance', description: 'Year-End Support' },
];


export const DataImportView: React.FC<DataImportViewProps> = ({ onDataImported }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setFileName(event.target.files[0].name);
    } else {
      setSelectedFile(null);
      setFileName(null);
    }
  };

  const handleImport = useCallback(() => {
    setIsImporting(true);
    // Simulate import process
    setTimeout(() => {
      if (selectedFile) {
        // Simulate parsing the selected file and create a distinct dataset
        const parsedDataFromFile: HistoricalData[] = [
          { id: 'file_1', date: '2024-01-15', revenue: 1500, expenses: 700, category: 'Uploaded Entry', description: `Data from ${selectedFile.name}` },
          { id: 'file_2', date: '2024-02-15', revenue: 1800, expenses: 900, category: 'Uploaded Entry', description: `Data from ${selectedFile.name}` },
          { id: 'file_3', date: '2024-03-15', revenue: 1600, expenses: 800, category: 'Uploaded Entry', description: `Data from ${selectedFile.name}` },
        ];
        onDataImported(parsedDataFromFile);
        // fileName is already set by handleFileChange reflecting the selected file.
      } else {
        onDataImported(sampleHistoricalData);
        setFileName('sample_financials.csv'); // Indicate sample data was loaded if no file was chosen
      }
      setIsImporting(false);
    }, 1500);
  }, [onDataImported, selectedFile]); // Ensure selectedFile is a dependency

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Import Financial Data</h2>
          <p className="text-gray-600 mb-6">
            Upload your past financial data (CSV/Excel) or connect to your accounting software (integrations coming soon).
            For now, you can load sample data or select a file to simulate custom data import.
          </p>

          <div className="mb-6 p-4 border border-dashed border-gray-300 rounded-lg text-center">
            <ArrowUpTrayIcon className="h-12 w-12 text-brandPrimary mx-auto mb-3" />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-brandSecondary font-medium hover:text-brandPrimary"
            >
              <span>Upload a file</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
            </label>
            <p className="text-xs text-gray-500 mt-1">CSV, XLSX, XLS up to 10MB</p>
            {fileName && <p className="text-sm text-green-600 mt-2">Selected: {fileName}</p>}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={handleImport} 
              variant="primary"
              disabled={isImporting}
            >
              {isImporting
                ? (selectedFile ? `Importing ${selectedFile.name}...` : 'Importing Sample Data...')
                : (selectedFile ? `Import ${selectedFile.name}` : 'Load Sample Data')}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-start">
            <LightBulbIcon className="h-8 w-8 text-brandPrimary mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Data Format Tips</h3>
              <p className="text-gray-600 mb-2">
                For best results, ensure your data includes columns for: <code className="bg-gray-200 px-1 rounded text-sm">Date</code>, <code className="bg-gray-200 px-1 rounded text-sm">Revenue</code>, and <code className="bg-gray-200 px-1 rounded text-sm">Expenses</code>.
              </p>
              <p className="text-gray-600">
                Optional columns like <code className="bg-gray-200 px-1 rounded text-sm">Category</code> and <code className="bg-gray-200 px-1 rounded text-sm">Description</code> can provide more detailed insights.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-start">
            <DocumentTextIcon className="h-8 w-8 text-brandSecondary mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Coming Soon: Direct Integrations</h3>
              <p className="text-gray-600">
                We're working on direct integrations with QuickBooks, Xero, Google Sheets, and more to make data import seamless.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};