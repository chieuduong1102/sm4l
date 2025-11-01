import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderMain from '../components/HeaderMain';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { saveSyncHistory, getSyncHistory, SyncHistoryItem, syncWalletUp, syncWalletDown } from '../services/SyncHistoryService';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Routes } from '../navigations/Routes';

library.add(fas);

const SettingScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>([]);
    const [showSyncSetting, setShowSyncSetting] = useState(false);
    const [endpoint, setEndpoint] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (showSyncSetting) {
            AsyncStorage.getItem('sync_endpoint').then(val => {
                if (val) setEndpoint(val);
            });
        }
    }, [showSyncSetting]);

    const fetchHistory = async () => {
        const history = await getSyncHistory();
        setSyncHistory(history);
    };

    const handleSyncUp = async () => {
        await saveSyncHistory('DB_UP');
        // await syncWalletUp();
        fetchHistory();
    };
    const handleSyncDown = async () => {
        await saveSyncHistory('DB_DOWN');
        // await syncWalletDown();
        fetchHistory();
    };

    const handleSaveEndpoint = async () => {
        await AsyncStorage.setItem('sync_endpoint', endpoint.trim());
        Alert('Đã lưu endpoint!');
    };

    return (
        <View style={styles.container}>
            <HeaderMain currentTitle="Đồng bộ" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <TouchableOpacity style={[styles.syncSettingBtn, { marginTop: insets.top + 100 }]} onPress={() => setShowSyncSetting(v => !v)}>
                    <FontAwesomeIcon icon={['fas', showSyncSetting ? 'chevron-up' : 'chevron-down']} color="#1a365d" size={16} />
                    <Text style={styles.syncSettingBtnText}>{showSyncSetting ? 'Thu gọn' : 'Cài đặt đồng bộ'}</Text>
                </TouchableOpacity>
                {showSyncSetting && (
                    <View style={styles.syncSettingView}>
                        <Text style={styles.labelEnpoint}>Endpoint</Text>
                        <TextInput
                            style={styles.input}
                            value={endpoint}
                            onChangeText={setEndpoint}
                            placeholder="Nhập endpoint"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEndpoint}>
                            <Text style={styles.saveBtnText}>Lưu</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <View style={[styles.section]}> 
                    <Text style={styles.sectionTitle}>Đồng bộ dữ liệu lên Database</Text>
                    <Text style={styles.sectionDesc}>
                        Tính năng này sẽ đồng bộ toàn bộ dữ liệu chi tiêu hiện tại trên máy của bạn lên Database.
                    </Text>
                    <TouchableOpacity style={styles.buttonUp} onPress={handleSyncUp}>
                        <FontAwesomeIcon icon={['fas', 'cloud-arrow-up']} color="#fff" size={26} />
                        <Text style={styles.buttonText}>Đồng bộ lên DB</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Đồng bộ dữ liệu từ Database</Text>
                    <Text style={styles.sectionDesc}>
                        Tính năng này sẽ lấy dữ liệu chi tiêu mới nhất từ Database về máy của bạn và ghi đè dữ liệu cũ.
                    </Text>
                    <TouchableOpacity style={styles.buttonDown} onPress={handleSyncDown}>
                        <FontAwesomeIcon icon={['fas', 'cloud-arrow-down']} color="#fff" size={26} />
                        <Text style={styles.buttonText}>Đồng bộ từ DB</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Lịch sử đồng bộ</Text>
                    {syncHistory.length === 0 && (
                        <Text style={styles.syncTime}>Chưa có lịch sử đồng bộ.</Text>
                    )}
                    {Object.entries(
                        syncHistory.reduce((acc: Record<string, SyncHistoryItem[]>, item) => {
                            const date = item.time.split(' ')[0];
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(item);
                            return acc;
                        }, {})
                    ).map(([date, items]) => (
                        <View key={date} style={{ marginBottom: 8 }}>
                            <View style={styles.syncDateDivider}>
                                <Text style={styles.syncDateDividerText}>| {date}</Text>
                            </View>
                            {items.map((item, idx) => (
                                <View style={styles.syncHistoryItem} key={idx}>
                                    <View style={[styles.syncTag, { backgroundColor: item.type === 'DB_UP' ? '#e67e22' : '#27ae60' }]}> 
                                        <Text style={styles.syncTagText}>{item.type === 'DB_UP' ? 'Đồng bộ lên DB' : 'Đồng bộ từ DB'}</Text>
                                    </View>
                                    <Text style={styles.syncTime}>{item.time}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 8,
    },
    sectionDesc: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
    },
    buttonUp: {
        backgroundColor: '#d35400',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonDown: {
        backgroundColor: '#27ae60',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    syncHistoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    syncTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 8,
        width: 120,
        alignItems: 'center',
    },
    syncTagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    syncTime: {
        fontSize: 16,
        color: '#64748b',
    },
    syncDateDivider: {
        marginVertical: 8,
        alignItems: 'flex-start',
    },
    syncDateDividerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a365d',
    },
    syncSettingBtn: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginBottom: 16,
        alignSelf: 'flex-end',
        paddingHorizontal: 16,
    },
    syncSettingBtnText: {
        color: '#1a365d',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    syncSettingView: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    labelEnpoint: {
        fontSize: 14,
        color: '#1a365d',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f8fafc',
    },
    saveBtn: {
        backgroundColor: '#1a365d',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default SettingScreen;
function Alert(arg0: string) {
    throw new Error('Function not implemented.');
}

