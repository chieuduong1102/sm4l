import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Routes } from '../navigations/Routes';

const PROFILE_NAME_KEY = 'profile_name';

const SetProfileScreen: React.FC = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const loadName = async () => {
            try {
                const storedName = await AsyncStorage.getItem(PROFILE_NAME_KEY);
                if (storedName) setName(storedName);
            } catch (e) {
                // ignore
            }
            setLoading(false);
        };
        loadName();
    }, []);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tên của bạn.');
            return;
        }
        try {
            await AsyncStorage.setItem(PROFILE_NAME_KEY, name.trim());
            navigation.reset({
                index: 0,
                routes: [{ name: Routes.HOME as never }],
            });
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể lưu tên.');
        }
    };

    if (loading) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nhập tên của bạn:</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Tên của bạn"
                autoFocus
            />
            <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>Let's go</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 24,
    },
    label: {
        fontSize: 18,
        marginBottom: 16,
        color: '#1a365d',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        maxWidth: 320,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 24,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#1a365d',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SetProfileScreen;
