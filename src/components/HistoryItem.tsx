import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistoryItemProps {
    eventName: string;
    tag: string;
    detail?: string;
    amount: string;
    dateTimePay: string;
    userPay: string;
    onEditPress?: (event: any) => void;
    eventData?: any;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ 
    eventName, 
    tag, 
    detail, 
    amount, 
    dateTimePay, 
    userPay, 
    onEditPress,
    eventData 
}) => {
    const [profileName, setProfileName] = useState<string | null>(null);
    const [clickCount, setClickCount] = useState(0);
    const [clickTimeout, setClickTimeout] = useState<number | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('profile_name').then(setProfileName);
    }, []);

    const handlePress = () => {
        // Clear existing timeout
        if (clickTimeout) {
            clearTimeout(clickTimeout);
        }

        const newClickCount = clickCount + 1;
        setClickCount(newClickCount);

        if (newClickCount === 5) {
            // Reset click count and trigger edit
            setClickCount(0);
            if (onEditPress && eventData) {
                onEditPress(eventData);
            }
        } else {
            // Set timeout to reset click count after 2 seconds
            const timeout = setTimeout(() => {
                setClickCount(0);
            }, 2000);
            setClickTimeout(timeout as any);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (clickTimeout) {
                clearTimeout(clickTimeout);
            }
        };
    }, [clickTimeout]);

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
            <View style={styles.textContainer}>
                <Text style={styles.eventName}>{eventName}</Text>
                <Text style={styles.tag}>{tag}</Text>
                {detail && <Text style={styles.detail}>{detail}</Text>}
                <Text style={styles.dateTime}>{dateTimePay}</Text>
                {userPay && (
                    <Text style={styles.byName}>by: <Text style={styles.byNameValue}>{userPay}</Text></Text>
                )}
            </View>
            <Text style={styles.amount}>- {amount}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    textContainer: {
        flex: 1,
    },
    eventName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a365d',
    },
    tag: {
        fontSize: 14,
        color: '#64748b',
    },
    detail: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    dateTime: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    byName: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    byNameValue: {
        color: '#2563eb',
        fontWeight: 'bold',
    },
    clickCounter: {
        fontSize: 10,
        color: '#f59e0b',
        fontWeight: 'bold',
        marginTop: 2,
    },
});

export default HistoryItem;