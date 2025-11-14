import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDataEventsMonthFromStore } from '../services/EventStorageService';

interface BudgetItem {
    id: string;
    category: string;
    amount: number;
    description: string;
    color: string;
}

interface BudgetComparisonProps {
    selectedMonth: string;
}

const BudgetComparison: React.FC<BudgetComparisonProps> = ({ selectedMonth }) => {
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [actualSpending, setActualSpending] = useState<Record<string, number>>({});

    const expenseTags = [
        { name: 'Ăn uống', color: '#ef4444' },
        { name: 'Đi lại', color: '#f97316' },
        { name: 'Mua sắm', color: '#eab308' },
        { name: 'Giải trí', color: '#22c55e' },
        { name: 'Y tế', color: '#06b6d4' },
        { name: 'Học tập', color: '#3b82f6' },
        { name: 'Nhà cửa', color: '#8b5cf6' },
    ];

    useEffect(() => {
        loadBudgetData();
        loadActualSpending();
    }, [selectedMonth]);

    const loadBudgetData = async () => {
        try {
            const key = `budget_${selectedMonth}`;
            const data = await AsyncStorage.getItem(key);
            if (data) {
                setBudgetItems(JSON.parse(data));
            } else {
                setBudgetItems([]);
            }
        } catch (error) {
            console.error('Error loading budget data:', error);
        }
    };

    const loadActualSpending = async () => {
        try {
            const events = await getDataEventsMonthFromStore(selectedMonth);
            const categoryAmounts: Record<string, number> = {};
            
            events.forEach(event => {
                const amount = parseInt(event.amount || event.formattedAmount || '0', 10);
                const category = event.tag || event.category || '';
                
                if (category && expenseTags.find(tag => tag.name === category)) {
                    categoryAmounts[category] = (categoryAmounts[category] || 0) + amount;
                }
            });
            
            setActualSpending(categoryAmounts);
        } catch (error) {
            console.error('Error loading actual spending:', error);
        }
    };

    const formatMoney = (amount: number) => {
        if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(2) + 'tr';
        if (amount >= 1_000) return (amount / 1_000).toFixed(2) + 'k';
        return amount.toString();
    };

    const calculateBarWidths = (budget: number, actual: number) => {
        const maxAmount = Math.max(budget, actual);
        
        if (maxAmount === 0) {
            return { budgetWidth: 100, actualWidth: 0 };
        }
        
        const budgetPercentage = (budget / maxAmount) * 100;
        const actualPercentage = (actual / maxAmount) * 100;
        
        return {
            budgetWidth: budgetPercentage,
            actualWidth: actualPercentage
        };
    };

    const renderComparisonItem = (item: BudgetItem) => {
        const actual = actualSpending[item.category] || 0;
        const budget = item.amount;
        const { budgetWidth, actualWidth } = calculateBarWidths(budget, actual);
        const isOverspent = actual > budget;
        const progressPercentage = budget > 0 ? (actual / budget) * 100 : 0;

        return (
            <View key={item.id} style={styles.comparisonItem}>
                <View style={styles.categoryHeader}>
                    <View style={styles.categoryInfo}>
                        <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                        <Text style={styles.categoryName}>{item.category}</Text>
                    </View>
                </View>

                {/* Dự trù */}
                <View style={styles.progressRow}>
                    <Text style={styles.rowLabel}>Dự trù:</Text>
                    <View style={styles.progressContainer}>
                        <View 
                            style={[
                                styles.progressBar, 
                                styles.budgetBar,
                                { width: `${budgetWidth}%` }
                            ]} 
                        />
                    </View>
                    <Text style={styles.amountText}>{formatMoney(budget)}</Text>
                </View>

                {/* Thực tế */}
                <View style={styles.progressRow}>
                    <Text style={styles.rowLabel}>Hiện tại:</Text>
                    <View style={styles.progressContainer}>
                        <View 
                            style={[
                                styles.progressBar, 
                                styles.actualBar,
                                { 
                                    width: `${actualWidth}%`,
                                    backgroundColor: isOverspent ? '#ef4444' : '#22c55e'
                                }
                            ]} 
                        />
                    </View>
                    <Text style={[
                        styles.amountText,
                        { color: isOverspent ? '#ef4444' : '#22c55e' }
                    ]}>
                        {formatMoney(actual)}
                    </Text>
                </View>

                {/* Thông tin tỷ lệ */}
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>
                        {progressPercentage.toFixed(1)}% đã sử dụng
                    </Text>
                    {isOverspent && (
                        <Text style={styles.overspendText}>
                            Vượt {((actual - budget) / budget * 100).toFixed(1)}%
                        </Text>
                    )}
                </View>
            </View>
        );
    };

    if (budgetItems.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>So sánh dự trù & thực tế</Text>
                <Text style={styles.emptyText}>
                    Chưa có kế hoạch chi tiêu. Hãy tạo kế hoạch trong tab "Kế hoạch chi tiêu"
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>So sánh dự trù & thực tế</Text>
            <View style={styles.comparisonList}>
                {budgetItems.map(renderComparisonItem)}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        margin: 16,
        borderRadius: 12,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 16,
        textAlign: 'center',
    },
    comparisonList: {
        gap: 16,
    },
    comparisonItem: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    categoryHeader: {
        marginBottom: 12,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    categoryColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a365d',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    rowLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        width: 70, // Fixed width để căn đều
        textAlign: 'left',
    },
    progressContainer: {
        flex: 1,
        height: 12,
        backgroundColor: '#e5e7eb',
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative',
    },
    progressBar: {
        height: 12,
        borderRadius: 6,
        minWidth: 4, // Đảm bảo luôn hiển thị được ít nhất 1 chút
    },
    budgetBar: {
        backgroundColor: '#3b82f6',
    },
    actualBar: {
        backgroundColor: '#22c55e',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        width: 60, // Fixed width để không bị đè
        textAlign: 'right',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    statsText: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
    },
    overspendText: {
        fontSize: 12,
        color: '#ef4444',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default BudgetComparison;