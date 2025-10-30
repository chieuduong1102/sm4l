import AsyncStorage from '@react-native-async-storage/async-storage';

export type SyncType = 'DB_UP' | 'DB_DOWN';

export interface SyncHistoryItem {
    type: SyncType;
    time: string; // dd/MM/yyyy hh:mm
}

const SYNC_HISTORY_KEY = 'sync_history';

export const saveSyncHistory = async (type: SyncType) => {
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
        const existing = await AsyncStorage.getItem(SYNC_HISTORY_KEY);
        return existing ? JSON.parse(existing) : [];
    } catch (e) {
        console.error('Error getting sync history', e);
        return [];
    }
};
