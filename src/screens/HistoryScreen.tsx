import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderMain from '../components/HeaderMain';
import HistoryItem from '../components/HistoryItem';
import { getDataAllEventsFromStore } from '../services/EventStorageService';
import packageJson from '../../package.json';

const HistoryScreen: React.FC = () => {
    const [groupedHistory, setGroupedHistory] = useState<Record<string, Record<string, any[]>>>({});
    const insets = useSafeAreaInsets();
    useEffect(() => {
        const fetchHistory = async () => {
            const allEvents = await getDataAllEventsFromStore();
            // Nhóm theo tháng, sau đó theo ngày
            const groupedByMonth = allEvents.reduce((acc: Record<string, Record<string, any[]>>, event) => {
                const monthYear = event.date.slice(0, 7); // yyyy-MM
                const fullDate = event.date; // yyyy-MM-dd
                const dayDate = `${event.date.slice(8, 10)}/${event.date.slice(5, 7)}/${event.date.slice(0, 4)}`; // dd/MM/yyyy
                
                if (!acc[monthYear]) {
                    acc[monthYear] = {};
                }
                if (!acc[monthYear][dayDate]) {
                    acc[monthYear][dayDate] = [];
                }
                acc[monthYear][dayDate].push(event);
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
                        {Object.keys(groupedHistory[monthYear]).map((dayDate) => (
                            <View key={dayDate} style={styles.daySection}>
                                <Text style={styles.dayTitle}>{dayDate}</Text>
                                {groupedHistory[monthYear][dayDate].map((event) => (
                                    <HistoryItem
                                        key={`${event.date}${event.time}`}
                                        eventName={event.tag}
                                        tag={event.tag}
                                        detail={event.detail}
                                        amount={event.formattedAmount}
                                        dateTimePay={event.dateTimePay || event.formattedTime}
                                        userPay={event.userPay}
                                    />
                                ))}
                            </View>
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
    daySection: {
        marginBottom: 16,
        paddingLeft: 8,
    },
    dayTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        paddingLeft: 8,
    },
});

export default HistoryScreen;