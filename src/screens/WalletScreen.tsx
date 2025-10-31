import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, FlatList, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderMain from '../components/HeaderMain';
import { getDataAllEventsFromStore, getDataEventsMonthFromStore } from '../services/EventStorageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WALLET_KEY = 'wallet_balance';

const WalletScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    
    const [balance, setBalance] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [spentThisMonth, setSpentThisMonth] = useState<number>(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    useEffect(() => {
        fetchBalance();
        fetchSpentThisMonth();
    }, []);

    useEffect(() => {
        // Chỉ gợi ý khi inputValue là số nhỏ (dưới 5 ký tự)
        if (!inputValue || isNaN(Number(inputValue)) || Number(inputValue) === 0 || inputValue.length > 4) {
            setSuggestions([]);
            return;
        }
        const num = parseInt(inputValue, 10);
        if (isNaN(num) || num === 0) {
            setSuggestions([]);
            return;
        }
        const options = [
            num * 1000,
            num * 10000,
            num * 100000,
            num * 1000000,
        ].map(n => n.toLocaleString());
        setSuggestions(options);
    }, [inputValue]);

    const fetchBalance = async () => {
        const value = await AsyncStorage.getItem(WALLET_KEY);
        setBalance(value ? parseInt(value, 10) : 0);
    };

    const fetchSpentThisMonth = async () => {
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthEvents = await getDataEventsMonthFromStore(monthStr);
        const spent = monthEvents.reduce((sum, e) => sum + (parseInt(e.amount || e.formattedAmount || '0', 10)), 0);
        setSpentThisMonth(spent);
    };

    const handleAddMoney = async () => {
        const add = parseInt(inputValue, 10);
        if (isNaN(add) || add <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!');
            return;
        }
        const newBalance = balance + add;
        await AsyncStorage.setItem(WALLET_KEY, newBalance.toString());
        setBalance(newBalance);
        setModalVisible(false);
        setInputValue('');
        Alert.alert('Thành công', `Đã nạp ${add.toLocaleString()} vào ví!`);
    };

    return (
        <View style={styles.container}>
            <HeaderMain currentTitle="Ví của bạn" />
            <View style={[styles.containerWallet, { marginTop: insets.top + 80 }]}> 
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
                    <Text style={styles.currentMonthLabel}>
                        Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                    </Text>
                </View>
                <View style={styles.walletBoxNoneBg}>
                    <Text style={styles.label}>Tổng số tiền</Text>
                    <Text style={styles.balance}>+ {balance.toLocaleString()} đ</Text>
                    <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                        <Text style={styles.addButtonText}>Nạp tiền vào ví</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.spentBox}>
                    <Text style={styles.label}>Đã chi trong tháng này</Text>
                    <Text style={styles.spent}>- {spentThisMonth.toLocaleString()} đ</Text>
                </View>
                <View style={styles.spentBox}>
                    <Text style={styles.label}>Số dư còn lại</Text>
                    <Text style={styles.balance}>= {(balance-spentThisMonth).toLocaleString()} đ</Text>
                </View>
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.label}>Nhập số tiền muốn nạp</Text>
                            <TextInput
                                style={styles.input}
                                keyboardType="numeric"
                                value={inputValue}
                                onChangeText={setInputValue}
                                placeholder="Nhập số tiền"
                            />
                            {suggestions.length > 0 && (
                                <FlatList
                                    data={suggestions}
                                    keyExtractor={item => item}
                                    renderItem={({ item }) => (
                                        <TouchableWithoutFeedback onPress={() => {
                                            setInputValue(item.replace(/\D/g, ''));
                                            setSuggestions([]);
                                        }}>
                                            <View style={styles.suggestionItem}>
                                                <Text style={styles.suggestionText}>{item} đ</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    )}
                                    style={styles.suggestionList}
                                />
                            )}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <TouchableOpacity style={styles.modalButton} onPress={handleAddMoney}>
                                    <Text style={styles.modalButtonText}>Xác nhận</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalButtonText}>Huỷ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
            {/* //View hisory */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    containerWallet: {
        flex: 1,
        padding: 16,
    },
    walletBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    walletBoxNoneBg: {
        backgroundColor: 'transparent',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 8,
    },
    balance: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#16a34a',
        marginBottom: 16,
    },
    totalAmount: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: '#1a365d',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    spentBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    spent: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        width: 320,
        alignItems: 'center',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 24,
        backgroundColor: '#fff',
    },
    modalButton: {
        backgroundColor: '#1a365d',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 24,
        marginHorizontal: 8,
        marginTop: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    suggestionList: {
        width: '100%',
        backgroundColor: '#f1f5f9',
        borderRadius: 8,
        marginBottom: 8,
        maxHeight: 160,
    },
    suggestionItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    suggestionText: {
        fontSize: 16,
        color: '#2563eb',
    },
    currentMonthLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a365d',
        textAlign: 'left',
        marginBottom: 16,
    },
    historyBtn: {
        backgroundColor: '#1a365d',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        textAlign: 'right',
    },
    historyBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default WalletScreen;
