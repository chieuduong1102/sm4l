import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import packageJson from '../../package.json';

const HeaderMain: React.FC<{ currentTitle: string }> = ({ currentTitle }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 80 }]}>
            <Text style={styles.titleScreen}>{currentTitle}</Text>
            <Text style={styles.subtitle}>{packageJson.homeName}❤️</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#E9EAEE',
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        position: 'absolute',
        top: 0,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    titleScreen: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
});

export default HeaderMain;