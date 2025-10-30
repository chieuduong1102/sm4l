import React from 'react';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Routes, RootStackParamList } from './Routes';
import StartScreen from '../screens/StartScreens';
import HomeScreen from '../screens/HomeScreen';
import AddEventScreen from '../screens/AddEventScreen';

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
    onStateChange?: (state: NavigationState | undefined) => void;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ onStateChange }) => {
    return (
        <NavigationContainer onStateChange={onStateChange}>
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;