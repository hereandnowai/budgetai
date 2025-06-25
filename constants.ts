
import { View, NavItem } from './types';
import { ChartPieIcon, ArrowTrendingUpIcon, TableCellsIcon, BeakerIcon, BellAlertIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const APP_NAME = "HERE AND NOW AI";
export const BRAND_SLOGAN = "designed with passion for innovation";

export const BRAND_LOGOS = {
  title: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Title%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-07.png",
  favicon: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/favicon-logo-with-name.png",
};

// Brand colors are defined in tailwind.config in index.html for CDN.
// These constants can be used if direct hex values are needed in JS, though Tailwind classes are preferred.
export const BRAND_COLORS_HEX = {
  primary: "#FFDF00",
  secondary: "#004040",
  textOnPrimary: "#004040",
  textOnSecondary: "#FFFFFF",
};


export const VIEW_DASHBOARD: View = 'DASHBOARD';
export const VIEW_DATA_IMPORT: View = 'DATA_IMPORT';
export const VIEW_BUDGET_PLANNER: View = 'BUDGET_PLANNER';
export const VIEW_SCENARIO_ANALYSIS: View = 'SCENARIO_ANALYSIS';
export const VIEW_ALERTS_RECOMMENDATIONS: View = 'ALERTS_RECOMMENDATIONS';

export const NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Dashboard', view: VIEW_DASHBOARD, icon: ChartPieIcon },
  { name: 'Import Data', view: VIEW_DATA_IMPORT, icon: ArrowDownTrayIcon },
  { name: 'Budget Planner', view: VIEW_BUDGET_PLANNER, icon: TableCellsIcon },
  { name: 'Scenario Analysis', view: VIEW_SCENARIO_ANALYSIS, icon: BeakerIcon },
  { name: 'Alerts & Recs', view: VIEW_ALERTS_RECOMMENDATIONS, icon: BellAlertIcon },
];

export const MOCK_API_KEY = "MOCK_GEMINI_API_KEY"; // Placeholder