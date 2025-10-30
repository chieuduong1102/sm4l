import React, { useState } from 'react';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Routes, RootStackParamList } from './Routes';
import StartScreen from '../screens/StartScreens';
import HomeScreen from '../screens/HomeScreen';
import AddEventScreen from '../screens/AddEventScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MenuMain from '../components/MenuMain';

const Stack = createStackNavigator<RootStackParamList>();

const routeToTab: Record<string, string> = {
    [Routes.HOME]: 'home',
    [Routes.HISTORY]: 'history',
    [Routes.STATISTICS]: 'statistics',
    [Routes.WALLET]: 'wallet',
    [Routes.SETTINGS]: 'settings',
};

interface AppNavigatorProps {
    onStateChange?: (state: NavigationState | undefined) => void;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ onStateChange }) => {
    const [currentRoute, setCurrentRoute] = React.useState<string>(Routes.START_SCREEN);

    const handleStateChange = (state: NavigationState | undefined) => {
        if (state) {
            const routeName = state.routes[state.index].name;
            setCurrentRoute(routeName);
        }
        if (onStateChange) {
            onStateChange(state);
        }
    };

    return (
        <NavigationContainer onStateChange={handleStateChange}>
            <Stack.Navigator
                initialRouteName={Routes.START_SCREEN}
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: false,
                }}
            >
                <Stack.Screen 
                    name={Routes.START_SCREEN} 
                    component={StartScreen}
                />
                <Stack.Screen 
                    name={Routes.HOME} 
                    component={HomeScreen}
                />
                <Stack.Screen 
                    name={Routes.ADD_EVENT} 
                    component={AddEventScreen}
                />
                <Stack.Screen 
                    name={Routes.HISTORY} 
                    component={HistoryScreen}
                />
                <Stack.Screen 
                    name={Routes.SETTINGS} 
                    component={SettingsScreen}
                />
            </Stack.Navigator>
            {currentRoute !== Routes.START_SCREEN && (
                <MenuMain activeTab={routeToTab[currentRoute] || 'home'} />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;