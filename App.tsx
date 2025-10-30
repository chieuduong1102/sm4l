/**
 * Sample React Native App
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationState } from '@react-navigation/native';
import AppNavigator from './src/navigations/AppNavigator';
import { Routes } from './src/navigations/Routes';
import MenuMain from './src/components/MenuMain';

function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(Routes.START_SCREEN);

  const onStateChange = (state: NavigationState | undefined) => {
    if (state) {
      const routeName = state.routes[state.index].name;
      setCurrentRoute(routeName);
    }
  };

  const shouldShowMenu = currentRoute !== Routes.START_SCREEN;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AppNavigator onStateChange={onStateChange} />
      {shouldShowMenu && <MenuMain />}
    </SafeAreaProvider>
  );
}

export default App;
