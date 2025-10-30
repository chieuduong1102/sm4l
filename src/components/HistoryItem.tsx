import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HistoryItemProps {
    eventName: string;
    tag: string;
    detail?: string;
    amount: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ eventName, tag, detail, amount }) => {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.eventName}>{eventName}</Text>
                <Text style={styles.tag}>{tag}</Text>
                {detail && <Text style={styles.detail}>{detail}</Text>}
            </View>
            <Text style={styles.amount}>- {amount}</Text>
        </View>
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
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ef4444',
    },
});

export default HistoryItem;