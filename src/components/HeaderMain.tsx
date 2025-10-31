import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import packageJson from '../../package.json';

const HeaderMain: React.FC<{ currentTitle: string }> = ({ currentTitle }) => {
    const insets = useSafeAreaInsets();
    const [profileName, setProfileName] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('profile_name').then(setProfileName);
    }, []);

    return (
        <View style={[styles.header, { paddingTop: insets.top, height: insets.top + 80 }]}> 
            <View style={styles.headerRow}>
                <Text style={styles.titleScreen}>{currentTitle}</Text>
                {profileName ? (
                    <Text style={styles.profileName}>{profileName}</Text>
                ) : null}
            </View>
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    titleScreen: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 4,
    },
    profileName: {
        color: '#2563eb', // màu xanh nổi bật
        fontWeight: 'bold',
        fontSize: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
});

export default HeaderMain;