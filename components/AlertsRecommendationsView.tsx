
import React from 'react';
import { Alert } from '../types';
import { Card } from './ui/Card';
import { BellAlertIcon, LightBulbIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface AlertsRecommendationsViewProps {
  alerts: Alert[];
  recommendations: string[];
  isLoading: boolean;
}

const AlertIconComponent: React.FC<{ severity: Alert['severity'], className?: string }> = ({ severity, className = "h-6 w-6" }) => {
  switch (severity) {
    case 'error':
      return <ExclamationTriangleIcon className={`${className} text-red-500`} />; // Semantic
    case 'warning':
      return <ExclamationTriangleIcon className={`${className} text-yellow-500`} />; // Semantic
    case 'info':
    default:
      return <InformationCircleIcon className={`${className} text-brandSecondary`} />; // Brand color for info
  }
};

export const AlertsRecommendationsView: React.FC<AlertsRecommendationsViewProps> = ({ alerts, recommendations, isLoading }) => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BellAlertIcon className="h-8 w-8 text-red-500 mr-3" /> {/* Semantic for alerts */}
            <h2 className="text-2xl font-semibold text-gray-800">Alerts</h2>
          </div>
          {isLoading && alerts.length === 0 && <div className="flex justify-center py-4"><LoadingSpinner /></div>}
          {!isLoading && alerts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3"/> {/* Semantic for "all good" */}
              No active alerts. Everything looks good!
            </div>
          )}
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-lg border-l-4 ${
                alert.severity === 'error' ? 'bg-red-50 border-red-500' :
                alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-sky-50 border-brandSecondary' // Use brand color for info border
              }`}>
                <div className="flex items-start">
                  <AlertIconComponent severity={alert.severity} className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className={`font-medium ${
                      alert.severity === 'error' ? 'text-red-700' :
                      alert.severity === 'warning' ? 'text-yellow-700' :
                      'text-brandSecondary' // Brand color for info text
                    }`}>{alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</p>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(alert.date).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <LightBulbIcon className="h-8 w-8 text-brandPrimary mr-3" /> {/* Brand color for recommendations */}
            <h2 className="text-2xl font-semibold text-gray-800">AI Recommendations</h2>
          </div>
           {isLoading && recommendations.length === 0 && <div className="flex justify-center py-4"><LoadingSpinner /></div>}
          {!isLoading && recommendations.length === 0 && (
             <div className="text-center py-8 text-gray-500">
                <InformationCircleIcon className="h-12 w-12 text-brandSecondary mx-auto mb-3"/> {/* Brand color for info */}
                No specific recommendations at this time. Keep your data updated for tailored advice.
            </div>
          )}
          <ul className="space-y-3">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" /> {/* Semantic for actionable/positive recs */}
                <p className="text-sm text-gray-700">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};