import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

// Add FontAwesome icons to library
library.add(fas);

const { width } = Dimensions.get('window');

interface MenuMainProps {
    activeTab?: string;
}

interface MenuItem {
    key: string;
    icon: IconProp;
    label: string;
    onPress: () => void;
}

const MenuMain: React.FC<MenuMainProps> = ({ activeTab = 'home' }) => {
    // Navigation functions
    const navigateToHistory = () => {
        console.log('Navigate to History Screen');
    };

    const navigateToStatistics = () => {
        console.log('Navigate to Statistics Screen');
    };

    const navigateToHome = () => {
        console.log('Navigate to Home Screen');
    };

    const navigateToWallet = () => {
        console.log('Navigate to Wallet Screen');
    };

    const navigateToMenu = () => {
        console.log('Navigate to Menu Screen');
    };

    const menuItems: MenuItem[] = [
        {
            key: 'history',
            icon: ['fas', 'history'],
            label: 'Lịch sử',
            onPress: navigateToHistory,
        },
        {
            key: 'statistics',
            icon: ['fas', 'chart-bar'],
            label: 'Thống kê',
            onPress: navigateToStatistics,
        },
        {
            key: 'home',
            icon: ['fas', 'home'],
            label: 'Trang chủ',
            onPress: navigateToHome,
        },
        {
            key: 'wallet',
            icon: ['fas', 'wallet'],
            label: 'Ví',
            onPress: navigateToWallet,
        },
        {
            key: 'menu',
            icon: ['fas', 'bars'],
            label: 'Menu',
            onPress: navigateToMenu,
        },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.menuBar}>
                {menuItems.map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.menuItem,
                            activeTab === item.key && styles.activeMenuItem,
                        ]}
                        onPress={item.onPress}
                        activeOpacity={0.7}
                    >
                        <FontAwesomeIcon
                            icon={item.icon}
                            size={22}
                            color={activeTab === item.key ? '#1a365d' : '#64748b'}
                        />
                        <Text
                            style={[
                                styles.menuLabel,
                                activeTab === item.key && styles.activeMenuLabel,
                            ]}
                        >
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    menuBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 8,
        paddingBottom: 12,
        backgroundColor: '#ffffff',
    },
    menuItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        minWidth: width / 5 - 10,
    },
    activeMenuItem: {
        backgroundColor: '#e0f2fe',
        borderRadius: 12,
    },
    menuLabel: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
        fontWeight: '500',
    },
    activeMenuLabel: {
        color: '#1a365d',
        fontWeight: 'bold',
    },
});

export default MenuMain;