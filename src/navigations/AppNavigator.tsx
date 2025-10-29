import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { Routes, RootStackParamList } from './Routes';
import StartScreen from '../screens/StartScreens';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
    return (
        <NavigationContainer>
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
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;