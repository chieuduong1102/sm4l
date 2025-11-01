import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderMain from '../components/HeaderMain';
import HistoryItem from '../components/HistoryItem';
import { getDataAllEventsFromStore } from '../services/EventStorageService';
import packageJson from '../../package.json';

const HistoryScreen: React.FC = () => {
    const [groupedHistory, setGroupedHistory] = useState<Record<string, any[]>>({});
    const insets = useSafeAreaInsets();
    useEffect(() => {
        const fetchHistory = async () => {
            const allEvents = await getDataAllEventsFromStore();
            const groupedByMonth = allEvents.reduce((acc: Record<string, any[]>, event) => {
                const monthYear = event.date.slice(0, 7); // yyyy-MM
                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(event);
                return acc;
            }, {});
            setGroupedHistory(groupedByMonth);
        };
        fetchHistory();
    }, []);

    return (
        <View style={styles.container}>
            <HeaderMain currentTitle="Lịch sử chi tiêu" />
            <ScrollView 
                contentContainerStyle={[styles.content, { 
                    paddingTop: insets.top + 100,
                    paddingBottom: insets.bottom + 40 // Thêm padding bottom đủ lớn
                }]}
                showsVerticalScrollIndicator={false}
            >    
                {Object.keys(groupedHistory).length === 0 && (
                    <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 32 }}>Chưa có lịch sử chi tiêu</Text>
                )}
                {Object.keys(groupedHistory).map((monthYear) => (
                    <View key={monthYear} style={styles.monthSection}>
                        <Text style={styles.monthTitle}>Tháng {monthYear.slice(5, 7)}/{monthYear.slice(0, 4)}</Text>
                        {groupedHistory[monthYear].map((event) => (
                            <HistoryItem
                                key={`${event.dateTimePay}`}
                                eventName={event.name}
                                tag={event.tag}
                                detail={event.detail}
                                amount={event.formattedAmount}
                                dateTimePay={event.dateTimePay || ''}
                                userPay={event.userPay}
                            />
                        ))}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingBottom: 16,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        // Bỏ flex: 1 để scroll hoạt động đúng
    },
    monthSection: {
        marginBottom: 24,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 12,
    },
});

export default HistoryScreen;