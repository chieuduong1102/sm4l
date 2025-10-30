// Routes constants for the application
export const Routes = {
  // Auth & Onboarding
  START_SCREEN: 'StartScreen',
  
  // Main App
  HOME: 'HomeScreen',
  ADD_EVENT: 'AddEventScreen',
  HISTORY: 'HistoryScreen',
  STATISTICS: 'StatisticsScreen',
  WALLET: 'WalletScreen',
} as const;

export type RootStackParamList = {
  [Routes.START_SCREEN]: undefined;
  [Routes.HOME]: undefined;
  [Routes.ADD_EVENT]: { selectedDate: string };
  [Routes.HISTORY]: undefined;
  [Routes.STATISTICS]: undefined;
  [Routes.WALLET]: undefined;
};