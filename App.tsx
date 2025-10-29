/**
 * Sample React Native App
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigations/AppNavigator';
import MenuMain from './src/components/MenuMain';

function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <MenuMain />
    </SafeAreaProvider>
  );
}

export default App;
