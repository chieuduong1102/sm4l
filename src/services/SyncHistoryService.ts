import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncType = 'DB_UP' | 'DB_DOWN';

export interface SyncHistoryItem {
    type: SyncType;
    time: string; // dd/MM/yyyy hh:mm
}

const SYNC_HISTORY_KEY = 'sync_history';
const WALLET_KEY = 'wallet_balance';
const WALLET_HISTORY_PREFIX = 'wallet_history_';
const WALLET_SYNC_KEY = 'wallet_sync_data';

export const saveSyncHistory = async (type: SyncType) => {
    //use data in AsyncStorage -> call API
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const newItem: SyncHistoryItem = { type, time };
    try {
        const existing = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
        const history: SyncHistoryItem[] = existing ? JSON.parse(existing) : [];
        history.unshift(newItem); // newest first
        await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error('Error saving sync history', e);
    }
};

export const getSyncHistory = async (): Promise<SyncHistoryItem[]> => {
    try {
        //Data real will get from API -> Update AsyncStorage
        const existing = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
        return existing ? JSON.parse(existing) : [];
    } catch (e) {
        console.error('Error getting sync history', e);
        return [];
    }
};

// Sync wallet data lên DB (mock: lưu vào WALLET_SYNC_KEY)
export const syncWalletUp = async () => {
    try {
        const balance = await AsyncStorage.getItem(WALLET_KEY);
        const keys = await AsyncStorage.getAllKeys();
        const historyKeys = keys.filter(k => k.startsWith(WALLET_HISTORY_PREFIX));
        const histories = await AsyncStorage.multiGet(historyKeys);
        const walletHistory = histories.map(([key, value]) => ({ key, value }));
        const data = { balance, walletHistory };
        //use data in AsyncStorage -> call API
        await AsyncStorage.setItem(WALLET_SYNC_KEY, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error('Error syncing wallet up', e);
        return false;
    }
};

// Sync wallet data từ DB (mock: lấy từ WALLET_SYNC_KEY)
export const syncWalletDown = async () => {
    try {
        const dataStr = await AsyncStorage.getItem(WALLET_SYNC_KEY);
        //Data real will get from API -> Update AsyncStorage
        if (!dataStr) return false;
        const data = JSON.parse(dataStr);
        if (data.balance) await AsyncStorage.setItem(WALLET_KEY, data.balance);
        if (Array.isArray(data.walletHistory)) {
            for (const item of data.walletHistory) {
                if (item.key && item.value) {
                    await AsyncStorage.setItem(item.key, item.value);
                }
            }
        }
        return true;
    } catch (e) {
        console.error('Error syncing wallet down', e);
        return false;
    }
};

// Ví dụ dữ liệu mockup cho lịch sử đồng bộ (SyncHistory):
// [
//   { type: 'DB_UP', time: '30/10/2025 09:15:00' },
//   { type: 'DB_DOWN', time: '29/10/2025 21:30:12' },
//   { type: 'DB_UP', time: '28/10/2025 08:00:45' }
// ]

// Ví dụ dữ liệu mockup cho đồng bộ ví (wallet):
// Dữ liệu lưu vào AsyncStorage với key: wallet_sync_data
//   [
//     { key: "wallet_history_2025-10", value: "{\"month\":\"2025-10\",\"totalAdded\":2000000,\"totalSpent\":1000000,\"balance\":1000000}" },
//     { key: "wallet_history_2025-09", value: "{\"month\":\"2025-09\",\"totalAdded\":500000,\"totalSpent\":300000,\"balance\":200000}" }
//   ]
// Khi gọi syncWalletUp sẽ lưu dữ liệu như trên vào key wallet_sync_data.
// Khi gọi syncWalletDown sẽ lấy dữ liệu từ key này và ghi đè lại số dư ví và lịch sử ví.


