import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, FlatList, TouchableWithoutFeedback, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderMain from '../components/HeaderMain';
import { getDataAllEventsFromStore, getDataEventsMonthFromStore } from '../services/EventStorageService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WALLET_KEY = 'wallet_balance';
const LENDING_KEY = 'lending_data';
const BORROWING_KEY = 'borrowing_data';
const _CREDIT_KEY = '_credit_data';

interface LendingItem {
    id: string;
    amount: number;
    description: string;
    date: string;
    isCompleted: boolean;
}

interface BorrowingItem {
    id: string;
    amount: number;
    description: string;
    date: string;
    isCompleted: boolean;
}

interface CreditItem {
    id: string;
    amount: number;
    description: string;
    date: string;
    isCompleted: boolean;
}

const WalletScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    
    const [activeTab, setActiveTab] = useState(0);
    const [balance, setBalance] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [spentThisMonth, setSpentThisMonth] = useState<number>(0);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    
    // Lending/Borrowing/ Credit states
    const [lendingModalVisible, setLendingModalVisible] = useState(false);
    const [borrowingModalVisible, setBorrowingModalVisible] = useState(false);
    const [CreditModalVisible, setCreditModalVisible] = useState(false);
    const [lendingAmount, setLendingAmount] = useState('');
    const [lendingDescription, setLendingDescription] = useState('');
    const [borrowingAmount, setBorrowingAmount] = useState('');
    const [borrowingDescription, setBorrowingDescription] = useState('');
    const [CreditAmount, setCreditAmount] = useState('');
    const [CreditDescription, setCreditDescription] = useState('');
    const [lendingData, setLendingData] = useState<LendingItem[]>([]);
    const [borrowingData, setBorrowingData] = useState<BorrowingItem[]>([]);
    const [CreditData, setCreditData] = useState<CreditItem[]>([]);
    const [lendingBorrowingTab, setLendingBorrowingTab] = useState(0);
    const [confirmModal, setConfirmModal] = useState({ visible: false, item: null as any, type: '' });
    const [clearDataModal, setClearDataModal] = useState({ visible: false, type: '' });
    const [clickCounters, setClickCounters] = useState({ lending: 0, borrowing: 0, credit: 0 });
    
    // Edit modal states
    const [editModal, setEditModal] = useState({ visible: false, item: null as any, type: '' });
    const [editAmount, setEditAmount] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        fetchBalance();
        fetchSpentThisMonth();
        fetchLendingBorrowingData();
    }, []);

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

    // Format number for display with dots
    const formatNumberDisplay = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Format number input for display (add dots)
    const formatNumberInput = (value: string) => {
        // Remove all non-digits
        const numericValue = value.replace(/[^\d]/g, '');
        if (!numericValue) return '';
        
        // Add dots every 3 digits from right
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Parse formatted input back to plain number
    const parseFormattedInput = (value: string) => {
        return value.replace(/\./g, '');
    };

    const fetchLendingBorrowingData = async () => {
        try {
            const lendingDataStr = await AsyncStorage.getItem(LENDING_KEY);
            const borrowingDataStr = await AsyncStorage.getItem(BORROWING_KEY);
            const CreditDataStr = await AsyncStorage.getItem(_CREDIT_KEY);
            
            if (lendingDataStr) {
                setLendingData(JSON.parse(lendingDataStr));
            }
            if (borrowingDataStr) {
                setBorrowingData(JSON.parse(borrowingDataStr));
            }
            if (CreditDataStr) {
                setCreditData(JSON.parse(CreditDataStr));
            }
        } catch (error) {
            console.error('Error fetching lending/borrowing/ Credit data:', error);
        }
    };

    const saveLendingData = async (data: LendingItem[]) => {
        try {
            await AsyncStorage.setItem(LENDING_KEY, JSON.stringify(data));
            setLendingData(data);
        } catch (error) {
            console.error('Error saving lending data:', error);
        }
    };

    const saveBorrowingData = async (data: BorrowingItem[]) => {
        try {
            await AsyncStorage.setItem(BORROWING_KEY, JSON.stringify(data));
            setBorrowingData(data);
        } catch (error) {
            console.error('Error saving borrowing data:', error);
        }
    };

    const saveCreditData = async (data: CreditItem[]) => {
        try {
            await AsyncStorage.setItem(_CREDIT_KEY, JSON.stringify(data));
            setCreditData(data);
        } catch (error) {
            console.error('Error saving Credit data:', error);
        }
    };

    const handleAddMoney = async () => {
        const add = parseInt(parseFormattedInput(inputValue), 10);
        if (isNaN(add) || add <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!');
            return;
        }
        const newBalance = balance + add;
        await AsyncStorage.setItem(WALLET_KEY, newBalance.toString());
        setBalance(newBalance);
        setModalVisible(false);
        setInputValue('');
        Alert.alert('Thành công', `Đã nạp ${formatNumberDisplay(add)} đ vào ví!`);
    };

    const handleAddLending = async () => {
        const amount = parseInt(parseFormattedInput(lendingAmount), 10);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!');
            return;
        }
        if (!lendingDescription.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả!');
            return;
        }

        const newItem: LendingItem = {
            id: Date.now().toString(),
            amount,
            description: lendingDescription,
            date: new Date().toLocaleDateString('vi-VN'),
            isCompleted: false,
        };

        const updatedData = [...lendingData, newItem];
        await saveLendingData(updatedData);
        
        setLendingModalVisible(false);
        setLendingAmount('');
        setLendingDescription('');
        Alert.alert('Thành công', 'Đã thêm khoản cho vay!');
    };

    const handleAddBorrowing = async () => {
        const amount = parseInt(parseFormattedInput(borrowingAmount), 10);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!');
            return;
        }
        if (!borrowingDescription.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả!');
            return;
        }

        const newItem: BorrowingItem = {
            id: Date.now().toString(),
            amount,
            description: borrowingDescription,
            date: new Date().toLocaleDateString('vi-VN'),
            isCompleted: false,
        };

        const updatedData = [...borrowingData, newItem];
        await saveBorrowingData(updatedData);
        
        setBorrowingModalVisible(false);
        setBorrowingAmount('');
        setBorrowingDescription('');
        Alert.alert('Thành công', 'Đã thêm khoản vay!');
    };

    const handleAddCredit = async () => {
        const amount = parseInt(parseFormattedInput(CreditAmount), 10);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!');
            return;
        }
        if (!CreditDescription.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả!');
            return;
        }

        const newItem: CreditItem = {
            id: Date.now().toString(),
            amount,
            description: CreditDescription,
            date: new Date().toLocaleDateString('vi-VN'),
            isCompleted: false,
        };

        const updatedData = [...CreditData, newItem];
        await saveCreditData(updatedData);
        
        setCreditModalVisible(false);
        setCreditAmount('');
        setCreditDescription('');
        Alert.alert('Thành công', 'Đã thêm giao dịch Credit!');
    };

    const handleCompleteItem = async () => {
        const { item, type } = confirmModal;
        if (type === 'lending') {
            const updatedData = lendingData.map(l => 
                l.id === item.id ? { ...l, isCompleted: true } : l
            );
            await saveLendingData(updatedData);
        } else if (type === 'borrowing') {
            const updatedData = borrowingData.map(b => 
                b.id === item.id ? { ...b, isCompleted: true } : b
            );
            await saveBorrowingData(updatedData);
        } else if (type === '-credit') {
            const updatedData = CreditData.map(e => 
                e.id === item.id ? { ...e, isCompleted: true } : e
            );
            await saveCreditData(updatedData);
        }
        setConfirmModal({ visible: false, item: null, type: '' });
        Alert.alert('Thành công', 'Đã hoàn tất!');
    };

    const getTotalLending = () => {
        return lendingData.filter(item => !item.isCompleted).reduce((sum, item) => sum + item.amount, 0);
    };

    const getTotalBorrowing = () => {
        return borrowingData.filter(item => !item.isCompleted).reduce((sum, item) => sum + item.amount, 0);
    };

    const getTotalCredit = () => {
        return CreditData.filter(item => !item.isCompleted).reduce((sum, item) => sum + item.amount, 0);
    };

    const getClearDataTitle = (type: string) => {
        switch (type) {
            case 'lending':
                return 'cho vay';
            case 'borrowing':
                return 'vay';
            case 'credit':
                return 'Credit';
            default:
                return '';
        }
    };

    const handleClearDataCancel = () => {
        const currentType = clearDataModal.type;
        // First close the modal
        setClearDataModal({ visible: false, type: '' });
        
        // Then reset the counter for the current type
        setTimeout(() => {
            if (currentType === 'lending') {
                setClickCounters(prev => ({ ...prev, lending: 0 }));
            } else if (currentType === 'borrowing') {
                setClickCounters(prev => ({ ...prev, borrowing: 0 }));
            } else if (currentType === 'credit') {
                setClickCounters(prev => ({ ...prev, credit: 0 }));
            }
        }, 100);
    };

    const handleEditItem = (item: any, type: string) => {
        setEditModal({ visible: true, item, type });
        setEditAmount(formatNumberInput(item.amount.toString()));
        setEditDescription(item.description);
    };

    const handleSaveEdit = async () => {
        const amount = parseInt(parseFormattedInput(editAmount), 10);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ!');
            return;
        }
        if (!editDescription.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập mô tả!');
            return;
        }

        const { item, type } = editModal;
        const updatedItem = {
            ...item,
            amount,
            description: editDescription,
            date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN'),
        };

        try {
            if (type === 'lending') {
                const updatedData = lendingData.map(l => 
                    l.id === item.id ? updatedItem : l
                );
                await saveLendingData(updatedData);
            } else if (type === 'borrowing') {
                const updatedData = borrowingData.map(b => 
                    b.id === item.id ? updatedItem : b
                );
                await saveBorrowingData(updatedData);
            } else if (type === 'evo-credit') {
                const updatedData = CreditData.map(e => 
                    e.id === item.id ? updatedItem : e
                );
                await saveCreditData(updatedData);
            }

            setEditModal({ visible: false, item: null, type: '' });
            setEditAmount('');
            setEditDescription('');
            Alert.alert('Thành công', 'Đã cập nhật thông tin!');
        } catch (error) {
            console.error('Error editing item:', error);
            Alert.alert('Lỗi', 'Không thể cập nhật thông tin!');
        }
    };

    const renderLendingBorrowingItem = ({ item, type }: { item: LendingItem | BorrowingItem, type: string }) => (
        <View style={[styles.lendingItem, item.isCompleted && styles.completedItem]}>
            <View style={styles.lendingItemContent}>
                <View style={styles.lendingItemLeft}>
                    <Text style={[styles.lendingDescription, item.isCompleted && styles.completedText]}>
                        {item.description}
                    </Text>
                    <Text style={[styles.lendingAmount, item.isCompleted && styles.completedText]}>
                        {type === 'lending' ? '+' : '-'} {formatNumberDisplay(item.amount)} đ
                    </Text>
                    <Text style={styles.lendingDate}>{item.date}</Text>
                </View>
                {!item.isCompleted && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.completeButton, styles.editButton]}
                            onPress={() => handleEditItem(item, type)}
                        >
                            <Text style={styles.completeButtonText}>Chỉnh sửa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.completeButton}
                            onPress={() => setConfirmModal({ visible: true, item, type })}
                        >
                            <Text style={styles.completeButtonText}>Hoàn tất</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );

    const renderWalletTab = () => (
        <View style={styles.containerWallet}>
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16}}>
                <Text style={styles.currentMonthLabel}>
                    Tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
                </Text>
            </View>
            <View style={styles.walletBoxNoneBg}>
                <Text style={styles.label}>Tổng số tiền trong ví</Text>
                <Text style={styles.balance}>+ {formatNumberDisplay(balance)} đ</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addButtonText}>Nạp tiền vào ví</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.spentBox}>
                <Text style={styles.label}>Đã chi trong tháng này</Text>
                <Text style={styles.spent}>- {formatNumberDisplay(spentThisMonth)} đ</Text>
            </View>
            <View style={styles.spentBox}>
                <Text style={styles.label}>Số dư còn lại</Text>
                <Text style={styles.balanceSpent}>= {formatNumberDisplay(balance-spentThisMonth)} đ</Text>
            </View>
        </View>
    );

    const renderLendingBorrowingTab = () => (
        <View style={styles.containerWallet}>
            <View style={styles.summaryContainer}>
                <TouchableOpacity style={styles.summaryBox} onPress={() => {
                    setClickCounters(prev => {
                        const newCounters = { ...prev, lending: prev.lending + 1 };
                        if (newCounters.lending === 5) {
                            setClearDataModal({ visible: true, type: 'lending' });
                        }
                        return newCounters;
                    });
                }}>
                    <Text style={styles.label}>Tổng cho vay</Text>
                    <Text style={[styles.balance, { color: '#1a365d' }]}>+ {formatNumberDisplay(getTotalLending())} đ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.summaryBox} onPress={() => {
                    setClickCounters(prev => {
                        const newCounters = { ...prev, borrowing: prev.borrowing + 1 };
                        if (newCounters.borrowing === 5) {
                            setClearDataModal({ visible: true, type: 'borrowing' });
                        }
                        return newCounters;
                    });
                }}>
                    <Text style={styles.label}>Tổng đang vay/nợ</Text>
                    <Text style={[styles.balance, { color: '#ef4444' }]}>- {formatNumberDisplay(getTotalBorrowing())} đ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.summaryBox} onPress={() => {
                    setClickCounters(prev => {
                        const newCounters = { ...prev, credit: prev.credit + 1 };
                        if (newCounters.credit === 5) {
                            setClearDataModal({ visible: true, type: 'credit' });
                        }
                        return newCounters;
                    });
                }}>
                    <Text style={styles.label}>Tổng tiêu dùng Credit</Text>
                    <Text style={[styles.balance, { color: '#ff793f' }]}>- {formatNumberDisplay(getTotalCredit())} đ</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={() => setLendingModalVisible(true)}>
                    <Text style={styles.actionButtonText}>+ Khoản Cho vay</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ef4444' }]} onPress={() => setBorrowingModalVisible(true)}>
                    <Text style={styles.actionButtonText}>+ Khoản Vay tiền</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ff793f' }]} onPress={() => setCreditModalVisible(true)}>
                    <Text style={styles.actionButtonText}>+ Khoản Credit</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.subTabContainer}>
                <TouchableOpacity
                    style={[styles.subTab, lendingBorrowingTab === 0 && styles.activeSubTab]}
                    onPress={() => setLendingBorrowingTab(0)}
                >
                    <Text style={[styles.subTabText, lendingBorrowingTab === 0 && styles.activeSubTabText]}>
                        Cho vay ({lendingData.filter(item => !item.isCompleted).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.subTab, lendingBorrowingTab === 1 && styles.activeSubTab]}
                    onPress={() => setLendingBorrowingTab(1)}
                >
                    <Text style={[styles.subTabText, lendingBorrowingTab === 1 && styles.activeSubTabText]}>
                        Đang vay ({borrowingData.filter(item => !item.isCompleted).length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.subTab, lendingBorrowingTab === 2 && styles.activeSubTab]}
                    onPress={() => setLendingBorrowingTab(2)}
                >
                    <Text style={[styles.subTabText, lendingBorrowingTab === 2 && styles.activeSubTabText]}>
                        Credit ({CreditData.filter(item => !item.isCompleted).length})
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={lendingBorrowingTab === 0 ? lendingData : lendingBorrowingTab === 1 ? borrowingData : CreditData}
                keyExtractor={item => item.id}
                renderItem={({ item }) => renderLendingBorrowingItem({ 
                    item, 
                    type: lendingBorrowingTab === 0 ? 'lending' : lendingBorrowingTab === 1 ? 'borrowing' : '-credit'
                })}
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <HeaderMain currentTitle="Ví của bạn" />
            <View style={[styles.tabContainer, { marginTop: insets.top + 80 }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 0 && styles.activeTab]}
                    onPress={() => setActiveTab(0)}
                >
                    <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
                        Quản lí ví
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 1 && styles.activeTab]}
                    onPress={() => setActiveTab(1)}
                >
                    <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
                        Khoản Vay/Cho vay
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.tabContent}>
                {activeTab === 0 ? renderWalletTab() : renderLendingBorrowingTab()}
            </ScrollView>

            {/* Existing Add Money Modal */}
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
                            onChangeText={(value) => setInputValue(formatNumberInput(value))}
                            placeholder="Nhập số tiền"
                        />
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

            {/* Lending Modal */}
            <Modal
                visible={lendingModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setLendingModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm khoản cho vay</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={lendingAmount}
                            onChangeText={(value) => setLendingAmount(formatNumberInput(value))}
                            placeholder="Nhập số tiền cho vay"
                        />
                        <TextInput
                            style={styles.input}
                            value={lendingDescription}
                            onChangeText={setLendingDescription}
                            placeholder="Mô tả (cho ai vay)"
                            multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleAddLending}>
                                <Text style={styles.modalButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={() => setLendingModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Huỷ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Borrowing Modal */}
            <Modal
                visible={borrowingModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setBorrowingModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm khoản vay</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={borrowingAmount}
                            onChangeText={(value) => setBorrowingAmount(formatNumberInput(value))}
                            placeholder="Nhập số tiền vay"
                        />
                        <TextInput
                            style={styles.input}
                            value={borrowingDescription}
                            onChangeText={setBorrowingDescription}
                            placeholder="Mô tả (vay ai)"
                            multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleAddBorrowing}>
                                <Text style={styles.modalButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={() => setBorrowingModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Huỷ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/*  Credit Modal */}
            <Modal
                visible={CreditModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCreditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Thêm giao dịch Credit</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={CreditAmount}
                            onChangeText={(value) => setCreditAmount(formatNumberInput(value))}
                            placeholder="Nhập số tiền tiêu dùng của thẻ tín dụng"
                        />
                        <TextInput
                            style={styles.input}
                            value={CreditDescription}
                            onChangeText={setCreditDescription}
                            placeholder="Mô tả giao dịch"
                            multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleAddCredit}>
                                <Text style={styles.modalButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ef4444' }]} onPress={() => setCreditModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Huỷ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Confirm Complete Modal */}
            <Modal
                visible={confirmModal.visible}
                transparent
                animationType="fade"
                onRequestClose={() => setConfirmModal({ visible: false, item: null, type: '' })}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Xác nhận hoàn tất</Text>
                        <Text style={styles.confirmText}>
                            Bạn có chắc chắn muốn hoàn tất khoản {confirmModal.type === 'lending' ? 'cho vay' : 'vay'} này đã hoàn tất?
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleCompleteItem}>
                                <Text style={styles.modalButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: '#ef4444' }]} 
                                onPress={() => setConfirmModal({ visible: false, item: null, type: '' })}
                            >
                                <Text style={styles.modalButtonText}>Huỷ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Clear Data Modal */}
            <Modal
                visible={clearDataModal.visible}
                transparent
                animationType="fade"
                onRequestClose={() => setClearDataModal({ visible: false, type: '' })}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Xác nhận xoá dữ liệu {getClearDataTitle(clearDataModal.type)}
                        </Text>
                        <Text style={styles.confirmText}>
                            Bạn có chắc chắn muốn xoá toàn bộ dữ liệu {getClearDataTitle(clearDataModal.type)} không?
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.modalButton} onPress={async () => {
                                const currentType = clearDataModal.type;
                                try {
                                    if (currentType === 'lending') {
                                        await AsyncStorage.removeItem(LENDING_KEY);
                                        setLendingData([]);
                                        setClickCounters(prev => ({ ...prev, lending: 0 }));
                                    } else if (currentType === 'borrowing') {
                                        await AsyncStorage.removeItem(BORROWING_KEY);
                                        setBorrowingData([]);
                                        setClickCounters(prev => ({ ...prev, borrowing: 0 }));
                                    } else if (currentType === 'credit') {
                                        await AsyncStorage.removeItem(_CREDIT_KEY);
                                        setCreditData([]);
                                        setClickCounters(prev => ({ ...prev, credit: 0 }));
                                    }
                                    setClearDataModal({ visible: false, type: '' });
                                    Alert.alert('Thành công', `Dữ liệu ${getClearDataTitle(currentType)} đã được xoá!`);
                                } catch (error) {
                                    console.error('Error clearing data:', error);
                                    Alert.alert('Lỗi', 'Không thể xoá dữ liệu!');
                                }
                            }}>
                                <Text style={styles.modalButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: '#ef4444' }]} 
                                onPress={handleClearDataCancel}
                            >
                                <Text style={styles.modalButtonText}>Huỷ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Modal */}
            <Modal
                visible={editModal.visible}
                transparent
                animationType="slide"
                onRequestClose={() => setEditModal({ visible: false, item: null, type: '' })}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={editAmount}
                            onChangeText={(value) => setEditAmount(formatNumberInput(value))}
                            placeholder="Nhập số tiền"
                        />
                        <TextInput
                            style={styles.input}
                            value={editDescription}
                            onChangeText={setEditDescription}
                            placeholder="Mô tả"
                            multiline
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TouchableOpacity style={styles.modalButton} onPress={handleSaveEdit}>
                                <Text style={styles.modalButtonText}>Lưu</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: '#ef4444' }]} 
                                onPress={() => setEditModal({ visible: false, item: null, type: '' })}
                            >
                                <Text style={styles.modalButtonText}>Huỷ</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        paddingBottom: 80,
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
        color: '#1a365d',
        marginBottom: 16,
    },
    balanceSpent: {
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
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#1a365d',
    },
    tabText: {
        fontSize: 16,
        color: '#64748b',
    },
    activeTabText: {
        color: '#1a365d',
        fontWeight: 'bold',
    },
    tabContent: {
        flex: 1,
    },
    summaryContainer: {
        flex: 1,
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    summaryBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        marginTop: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#1a365d',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    subTabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    subTab: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    activeSubTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#1a365d',
    },
    subTabText: {
        fontSize: 16,
        color: '#64748b',
    },
    activeSubTabText: {
        color: '#1a365d',
        fontWeight: 'bold',
    },
    listContainer: {
        flex: 1,
    },
    lendingItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    completedItem: {
        backgroundColor: '#e2e8f0',
    },
    lendingItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    lendingItemLeft: {
        flex: 1,
        marginRight: 12,
    },
    lendingDescription: {
        fontSize: 16,
        color: '#1a365d',
        marginBottom: 4,
    },
    lendingAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 4,
    },
    lendingDate: {
        fontSize: 12,
        color: '#64748b',
    },
    completeButton: {
        backgroundColor: '#16a34a',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        width: 110,
        alignItems: 'center',
    },
    completeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#64748b',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 16,
    },
    confirmText: {
        fontSize: 16,
        color: '#1a365d',
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    editButton: {
        backgroundColor: '#1a365d',
    },
});

export default WalletScreen;
