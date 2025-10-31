import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDataEventsMonthFromStore } from './EventStorageService';

export interface WalletHistory {
    month: string; // 'YYYY-MM'
    totalAdded: number;
    totalSpent: number;
    totalBalance: number;
}

const getWalletHistoryKey = (month: string) => `wallet_history_${month}`;

export const addMoneyToWalletHistory = async (amount: number, date: Date = new Date()) => {
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const key = getWalletHistoryKey(month);
    const existing = await AsyncStorage.getItem(key);
    let history: WalletHistory = existing ? JSON.parse(existing) : { month, totalAdded: 0, totalSpent: 0 };
    history.totalAdded += amount;
    await AsyncStorage.setItem(key, JSON.stringify(history));
};

export const addSpentToWalletHistory = async (amount?: number, date: Date = new Date()) => {
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const key = getWalletHistoryKey(month);
    const existing = await AsyncStorage.getItem(key);
    let history: WalletHistory = existing ? JSON.parse(existing) : { month, totalAdded: 0, totalSpent: 0 };
    // Nếu không truyền amount, sẽ lấy tổng chi tháng này từ store
    let totalSpent = 0;
    if (typeof amount === 'number') {
        totalSpent = history.totalSpent + amount;
    } else {
        const monthEvents = await getDataEventsMonthFromStore(month);
        totalSpent = monthEvents.reduce((sum, e) => sum + (parseInt(e.amount || e.formattedAmount || '0', 10)), 0);
    }
    history.totalSpent = totalSpent;
    await AsyncStorage.setItem(key, JSON.stringify(history));
};

export const addBalanceToWalletHistory = async (date: Date = new Date()) => {
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const key = getWalletHistoryKey(month);
    const existing = await AsyncStorage.getItem(key);
    let history: WalletHistory = existing ? JSON.parse(existing) : { month, totalAdded: 0, totalSpent: 0 };
    const balance = history.totalAdded - history.totalSpent;
    history.totalBalance = balance;
    await AsyncStorage.setItem(key, JSON.stringify(history));
};

export const getWalletHistory = async (month: string): Promise<WalletHistory> => {
    const key = getWalletHistoryKey(month);
    const existing = await AsyncStorage.getItem(key);
    return existing ? JSON.parse(existing) : { month, totalAdded: 0, totalSpent: 0, totalBalance: 0};
};
