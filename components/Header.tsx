
import React from 'react';
import { UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';

export const Header: React.FC = () => {
  return (
    <header className="h-20 bg-white shadow-md flex items-center justify-between px-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Financial Overview</h2>
        <p className="text-sm text-gray-500">Welcome to your intelligent budgeting dashboard.</p>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative text-brandSecondary hover:text-brandPrimary">
          <BellIcon className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-2">
          <UserCircleIcon className="h-8 w-8 text-brandSecondary" />
          <span className="text-sm font-medium text-gray-700">Demo User</span>
        </div>
      </div>
    </header>
  );
};