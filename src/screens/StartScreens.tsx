import React, { useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { Routes, RootStackParamList } from '../navigations/Routes';

const packageJson = require('../../package.json');
const { width, height } = Dimensions.get('window');

type StartScreenNavigationProp = StackNavigationProp<RootStackParamList, typeof Routes.START_SCREEN>;

const StartScreen = () => {
    const navigation = useNavigation<StartScreenNavigationProp>();

    useEffect(() => {
        // Auto navigate to Main Tabs after 3 seconds
        const timer = setTimeout(() => {
            navigation.navigate(Routes.HOME);
        }, 3000);

        // Cleanup timer if component unmounts
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/sm4l-logo.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* App Name */}
                <Text style={styles.appName}>SMoney4Life</Text>

                {/* Home Name */}
                <Text style={styles.homeName}>Chào mừng, {packageJson.homeName}</Text>

                {/* Slogan */}
                <Text style={styles.slogan}>
                    Quản lý tài chính thông minh{'\n'}
                    Cuộc sống của bạn sẽ tốt hơn
                </Text>

                {/* Version or Additional Info */}
                <View style={styles.footer}>
                    <Text style={styles.version}>Phiên bản {packageJson.version}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a365d', // Dark blue background
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
        borderRadius: (width * 0.4) / 2,
        borderWidth: 3,
        borderColor: '#ffffff',
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
        textAlign: 'center',
    },
    homeName: {
        fontSize: 24,
        color: '#ffffff',
        marginBottom: 20,
        textAlign: 'center',
    },
    slogan: {
        fontSize: 18,
        color: '#e2e8f0',
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: 40,
    },
    footer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    version: {
        fontSize: 14,
        color: '#94a3b8',
    },
});

export default StartScreen;