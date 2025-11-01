import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDataAllEventsFromStore } from './EventStorageService';
import { Alert } from 'react-native';

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
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const time = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    try {
        // Lấy endpoint từ store
        const endpoint = await AsyncStorage.getItem('sync_endpoint');
        if (!endpoint || !endpoint.trim()) {
            Alert.alert('Lỗi', 'Chưa cấu hình endpoint đồng bộ');
            return;
        }

        if (type === 'DB_UP') {
            // Lấy data events và call API POST
            const allEvents = await getDataAllEventsFromStore();
            const eventsData = allEvents.map(event => ({
                name: event.name || event.eventName || '',
                amount: event.amount || 0,
                category: event.category || event.tag || '',
                time: event.time || '',
                date: event.date || '',
                formattedTime: event.formattedTime || '',
                userPay: event.userPay || ''
            }));

            const response = await fetch(`${endpoint.trim()}/insertDataEvent.aspx`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventsData)
            });

            if (response.ok) {
                Alert.alert('Thành công', 'Đã đồng bộ dữ liệu lên server thành công');
                const newItem: SyncHistoryItem = { type, time };
                const existing = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
                const history: SyncHistoryItem[] = existing ? JSON.parse(existing) : [];
                history.unshift(newItem);
                await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
            } else {
                Alert.alert('Lỗi', `Không thể đồng bộ lên server. Status: ${response.status}`);
            }

        } else if (type === 'DB_DOWN') {
            // Call API GET và update vào store
            const response = await fetch(`${endpoint.trim()}/getAllDataEvent.aspx`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const eventsData = await response.json();
                
                // Clear existing events và lưu data mới
                const keys = await AsyncStorage.getAllKeys();
                const eventKeys = keys.filter(key => key.startsWith('event_'));
                await AsyncStorage.multiRemove(eventKeys);

                // Nhóm events theo date và lưu vào store
                const eventsByDate: Record<string, any[]> = {};
                eventsData.forEach((event: any) => {
                    const date = event.date;
                    if (!eventsByDate[date]) eventsByDate[date] = [];
                    eventsByDate[date].push({
                        name: event.name,
                        amount: event.amount,
                        category: event.category,
                        time: event.time,
                        userPay: event.userPay
                    });
                });

                // Lưu từng ngày vào AsyncStorage
                for (const [date, events] of Object.entries(eventsByDate)) {
                    const key = `event_${date}`;
                    await AsyncStorage.setItem(key, JSON.stringify(events));
                }

                Alert.alert('Thành công', `Đã đồng bộ ${eventsData.length} sự kiện từ server về máy`);
                const newItem: SyncHistoryItem = { type, time };
                const existing = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
                const history: SyncHistoryItem[] = existing ? JSON.parse(existing) : [];
                history.unshift(newItem);
                await AsyncStorage.setItem(SYNC_HISTORY_KEY, JSON.stringify(history));
            } else {
                Alert.alert('Lỗi', `Không thể tải dữ liệu từ server. Status: ${response.status}`);
            }
        }
    } catch (error) {
        console.error('Error in saveSyncHistory:', error);
        Alert.alert('Lỗi', `Lỗi kết nối: ${error instanceof Error ? error.message : 'Unknown error'}`);
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


