
import React from 'react';
import { View, NavItem } from '../types';
import { NAVIGATION_ITEMS, BRAND_LOGOS, BRAND_SLOGAN, APP_NAME } from '../constants';
// BuildingOffice2Icon is removed as we are using an image logo

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  return (
    <div className="w-64 bg-brandSecondary text-brandTextOnSecondary flex flex-col">
      <div className="h-24 flex items-center justify-center p-4 border-b border-brandSecondaryHover">
        <img src={BRAND_LOGOS.title} alt={`${APP_NAME} Logo`} className="h-auto w-full max-h-16 object-contain" />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {NAVIGATION_ITEMS.map((item: NavItem) => (
          <button
            key={item.name}
            onClick={() => setCurrentView(item.view)}
            className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors duration-150
              ${currentView === item.view 
                ? 'bg-brandPrimary text-brandTextOnPrimary shadow-md' 
                : 'hover:bg-brandPrimaryHover hover:bg-opacity-20 hover:text-brandPrimary'
              }`}
            aria-current={currentView === item.view ? 'page' : undefined}
          >
            <item.icon className={`h-6 w-6 ${currentView === item.view ? 'text-brandTextOnPrimary' : 'text-brandTextOnSecondary group-hover:text-brandPrimary'}`} />
            <span className={`${currentView === item.view ? 'text-brandTextOnPrimary' : 'text-brandTextOnSecondary group-hover:text-brandPrimary'}`}>{item.name}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-brandSecondaryHover text-center">
        <p className="text-xs text-gray-400 mb-1">© {new Date().getFullYear()} {APP_NAME}</p>
        <p className="text-xs text-gray-500 italic">{BRAND_SLOGAN}</p>
      </div>
    </div>
  );
};