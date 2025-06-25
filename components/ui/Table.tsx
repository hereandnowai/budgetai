
import React, { ReactNode } from 'react';

interface TableColumn {
  Header: string;
  accessor: string;
}

interface TableProps {
  columns: TableColumn[];
  data: Array<Record<string, ReactNode>>; // Data where keys match accessors and values are renderable
  className?: string;
}

export const Table: React.FC<TableProps> = ({ columns, data, className = '' }) => {
  if (!data || data.length === 0) {
    return <p className="text-gray-500 py-4 text-center">No data available.</p>;
  }

  return (
    <div className={`overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.Header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
              {columns.map((column) => (
                <td key={column.accessor} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
