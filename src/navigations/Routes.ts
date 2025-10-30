// Routes constants for the application
export const Routes = {
  // Auth & Onboarding
  START_SCREEN: 'StartScreen',
  
  // Main App
  HOME: 'HomeScreen',
  ADD_EVENT: 'AddEventScreen',
  HISTORY: 'History',
  STATISTICS: 'Statistics',  
  WALLET: 'Wallet',
  MENU: 'Menu',
} as const;

export type RootStackParamList = {
  [Routes.START_SCREEN]: undefined;
  [Routes.HOME]: undefined;
  [Routes.ADD_EVENT]: { selectedDate: string };
};