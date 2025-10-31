import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getDataEventsMonthFromStore } from '../services/EventStorageService';
import HeaderMain from '../components/HeaderMain';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getWalletHistory } from '../services/WalletHistoryService';
import { ScrollView as RNScrollView } from 'react-native';

const { width } = Dimensions.get('window');

const StatisticsScreen: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    });
    const insets = useSafeAreaInsets();
    const [labels, setLabels] = useState<string[]>([]);
    const [data, setData] = useState<number[]>([]);
    const [monthList, setMonthList] = useState<string[]>([]);
    const [walletLabels, setWalletLabels] = useState<string[]>([]);
    const [walletAdded, setWalletAdded] = useState<number[]>([]);
    const [walletSpent, setWalletSpent] = useState<number[]>([]);
    const [walletMonthLabels, setWalletMonthLabels] = useState<string[]>([]);
    const [walletMonthAdded, setWalletMonthAdded] = useState<number[]>([]);
    const [walletMonthSpent, setWalletMonthSpent] = useState<number[]>([]);

    useEffect(() => {
        // Lấy danh sách các tháng có dữ liệu trong store
        const fetchMonths = async () => {
            const keys = await AsyncStorage.getAllKeys();
            const eventKeys = keys.filter((key) => key.startsWith('event_'));
            const monthsSet = new Set<string>();
            eventKeys.forEach(key => {
                const date = key.replace('event_', '');
                const month = date.slice(0, 7); // yyyy-MM
                monthsSet.add(month);
            });
            // Sắp xếp giảm dần (mới nhất trước)
            const months = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
            setMonthList(months);
        };
        fetchMonths();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const events = await getDataEventsMonthFromStore(selectedMonth);
            // Gom nhóm theo ngày trong tháng
            const days: Record<string, number> = {};
            events.forEach(e => {
                const day = e.date.slice(8, 10);
                const amount = parseInt(e.amount || e.formattedAmount || '0', 10);
                days[day] = (days[day] || 0) + amount;
            });
            // Tính tổng cộng dồn tăng dần theo ngày
            const sortedDays = Object.keys(days).sort();
            let sum = 0;
            const chartData: number[] = [];
            const chartLabels: string[] = [];
            sortedDays.forEach(day => {
                sum += days[day];
                chartData.push(sum);
                chartLabels.push(day);
            });
            setLabels(chartLabels);
            setData(chartData);
        };
        fetchData();
    }, [selectedMonth]);

    useEffect(() => {
        // Lấy dữ liệu chartWallet
        const fetchWalletChart = async () => {
            // Lấy 12 tháng gần nhất có trong monthList
            const months = monthList.slice().reverse(); // tăng dần thời gian
            const labels: string[] = [];
            const added: number[] = [];
            const spent: number[] = [];
            for (const month of months) {
                const history = await getWalletHistory(month);
                labels.push(month.slice(5, 7));
                added.push(history.totalAdded || 0);
                spent.push(history.totalSpent || 0);
            }
            setWalletLabels(labels);
            setWalletAdded(added);
            setWalletSpent(spent);
        };
        if (monthList.length > 0) fetchWalletChart();
    }, [monthList]);

    useEffect(() => {
        // Lấy dữ liệu ví của tháng đã chọn
        const fetchWalletMonthChart = async () => {
            const events = await getDataEventsMonthFromStore(selectedMonth);
            // Gom nhóm theo ngày trong tháng
            const days: Record<string, { added: number; spent: number }> = {};
            events.forEach(e => {
                const day = e.date.slice(8, 10);
                const amount = parseInt(e.amount || e.formattedAmount || '0', 10);
                // Giả sử event có type: 'add' hoặc 'spend', nếu không có thì mặc định là chi tiêu
                if (!days[day]) days[day] = { added: 0, spent: 0 };
                if (e.type === 'add') days[day].added += amount;
                else days[day].spent += amount;
            });
            // Tính cộng dồn tăng dần theo ngày
            const sortedDays = Object.keys(days).sort();
            let sumAdded = 0;
            let sumSpent = 0;
            const chartLabels: string[] = [];
            const chartAdded: number[] = [];
            const chartSpent: number[] = [];
            sortedDays.forEach(day => {
                sumAdded += days[day].added;
                sumSpent += days[day].spent;
                chartLabels.push(day);
                chartAdded.push(sumAdded);
                chartSpent.push(sumSpent);
            });
            setWalletMonthLabels(chartLabels);
            setWalletMonthAdded(chartAdded);
            setWalletMonthSpent(chartSpent);
        };
        fetchWalletMonthChart();
    }, [selectedMonth]);

    // Format số tiền cho trục dọc: 1000 => 1k, 1000000 => 1tr
    const formatMoney = (value: string) => {
        const numValue = parseFloat(value);
        if (numValue >= 1_000_000) return (numValue / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'tr';
        if (numValue >= 1_000) return (numValue / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
        return numValue.toString();
    };

    return (
        <View style={styles.container}>
            <HeaderMain currentTitle="Thống kê" />
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
                <View style={[styles.headerContainer, { marginTop: insets.top + 100 }]}>
                    <Text style={styles.label}>Thông kê hàng tháng</Text>
                    <View style={styles.monthPicker}>
                        {monthList.map(month => (
                            <TouchableOpacity
                                key={month}
                                style={[styles.monthBtn, selectedMonth === month && styles.monthBtnActive]}
                                onPress={() => setSelectedMonth(month)}
                            >
                                <Text style={selectedMonth === month ? styles.monthBtnTextActive : styles.monthBtnText}>
                                    {month.slice(5, 7)}/{month.slice(0, 4)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={[styles.chartGroupContainer, {paddingBottom: insets.bottom + 40}]}>
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Biểu đồ chi tiêu tháng</Text>
                        <RNScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {data.length > 0 ? (
                                <LineChart
                                    data={{
                                        labels: labels.map(day => String(Number(day))), // hiển thị ngày dạng số
                                        datasets: [{ data }],
                                        legend: ['Số tiền đã chi tiêu (cộng dồn)'],
                                    }}
                                    width={Math.max((labels.length || 1) * 40, width - 32)}
                                    height={260}
                                    yAxisSuffix=""
                                    yLabelsOffset={8}
                                    chartConfig={{
                                        backgroundColor: '#fff',
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                                        labelColor: () => '#64748b',
                                        style: { borderRadius: 4 },
                                        propsForDots: {
                                            r: '4',
                                            strokeWidth: '2',
                                            stroke: '#2563eb',
                                        },
                                        formatYLabel: formatMoney,
                                    }}
                                    bezier
                                    style={{ borderRadius: 4 }}
                                    formatYLabel={formatMoney}
                                />
                            ) : (
                                <Text style={styles.noData}>Không có dữ liệu chi tiêu tháng này.</Text>
                            )}
                        </RNScrollView>
                    </View>
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Biểu đồ ví tháng này</Text>
                        <RNScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {/* {walletMonthLabels.length > 0 ? (
                                <LineChart
                                    data={{
                                        labels: walletMonthLabels.map(day => String(Number(day))),
                                        datasets: [
                                            { data: walletMonthAdded, color: () => '#2563eb', strokeWidth: 2, withDots: true },
                                            { data: walletMonthSpent, color: () => '#ef4444', strokeWidth: 2, withDots: true },
                                        ],
                                        legend: ['Nạp vào', 'Đã dùng'],
                                    }}
                                    width={Math.max((walletMonthLabels.length || 1) * 40, width - 32)}
                                    height={260}
                                    yAxisSuffix=""
                                    yLabelsOffset={8}
                                    chartConfig={{
                                        backgroundColor: '#fff',
                                        backgroundGradientFrom: '#fff',
                                        backgroundGradientTo: '#fff',
                                        decimalPlaces: 0,
                                        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                                        labelColor: () => '#64748b',
                                        style: { borderRadius: 4 },
                                        propsForDots: {
                                            r: '4',
                                            strokeWidth: '2',
                                            stroke: '#2563eb',
                                        },
                                        formatYLabel: formatMoney,
                                    }}
                                    bezier
                                    style={{ borderRadius: 4 }}
                                    formatYLabel={formatMoney}
                                />
                            ) : (
                                <Text style={styles.noData}>Không có dữ liệu ví tháng này.</Text>
                            )} */}
                            <Text style={styles.noData}>Coming soon...</Text>
                        </RNScrollView>
                    </View>
                </View>
            </ScrollView >
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
        paddingHorizontal: 16,
    },
    chartEvents: {
        flex: 1,
        paddingHorizontal: 16,
    },
    chartGroupContainer: {

    },
    label: {
        fontSize: 20,
        color: '#1a365d',
        fontWeight: 'bold',
    },
    monthPicker: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        marginHorizontal: 8,
        marginBottom: 16,
    },
    monthBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        backgroundColor: '#e0e7ef',
        marginRight: 8,
        marginBottom: 8,
    },
    monthBtnActive: {
        backgroundColor: '#1a365d',
    },
    monthBtnText: {
        color: '#e3f2fd',
        fontWeight: 'bold',
    },
    monthBtnTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    chartContainer: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noData: {
        color: '#64748b',
        fontSize: 16,
        textAlign: 'center',
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 8,
        textAlign: 'center',
    },
});

export default StatisticsScreen;
