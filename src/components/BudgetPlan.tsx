import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    Modal, 
    TextInput, 
    Alert, 
    Keyboard, 
    TouchableWithoutFeedback, 
    KeyboardAvoidingView, 
    Platform,
    Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const WALLET_KEY = 'wallet_balance';

interface BudgetItem {
    id: string;
    category: string;
    amount: number;
    description: string;
    color: string;
}

interface BudgetPlanProps {
    selectedMonth: string;
}

const BudgetPlan: React.FC<BudgetPlanProps> = ({ selectedMonth }) => {
    const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [clickCount, setClickCount] = useState<Record<string, number>>({});

    const expenseTags = [
        { name: 'Ăn uống', color: '#ef4444' },
        { name: 'Đi lại', color: '#f97316' },
        { name: 'Mua sắm', color: '#eab308' },
        { name: 'Giải trí', color: '#22c55e' },
        { name: 'Y tế', color: '#06b6d4' },
        { name: 'Học tập', color: '#3b82f6' },
        { name: 'Nhà cửa', color: '#8b5cf6' },
        { name: 'Khác', color: '#6b7280' },
    ];

    useEffect(() => {
        loadBudgetData();
        loadWalletBalance();
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

    const loadWalletBalance = async () => {
        try {
            const balance = await AsyncStorage.getItem(WALLET_KEY);
            if (balance) {
                const parsedBalance = typeof balance === 'string' ? parseInt(balance, 10) : balance;
                setWalletBalance(parsedBalance || 0);
            } else {
                setWalletBalance(0);
            }
        } catch (error) {
            console.error('Error loading wallet balance:', error);
            setWalletBalance(0);
        }
    };

    const saveBudgetData = async (items: BudgetItem[]) => {
        try {
            const key = `budget_${selectedMonth}`;
            await AsyncStorage.setItem(key, JSON.stringify(items));
        } catch (error) {
            console.error('Error saving budget data:', error);
        }
    };

    const formatMoney = (amount: number) => {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseMoney = (value: string) => {
        return parseInt(value.replace(/\./g, ''), 10) || 0;
    };

    const handleAmountChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '');
        if (numericText) {
            const formatted = formatMoney(parseInt(numericText, 10));
            setAmount(formatted);
        } else {
            setAmount('');
        }
    };

    const openModal = (category?: string, item?: BudgetItem) => {
        if (item) {
            setEditingId(item.id);
            setSelectedCategory(item.category);
            setAmount(formatMoney(item.amount));
            setDescription(item.description);
        } else {
            setEditingId(null);
            setSelectedCategory(category || '');
            setAmount('');
            setDescription('');
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        try {
            Keyboard.dismiss();
        } catch (error) {
            console.log('Keyboard dismiss error:', error);
        }
        setModalVisible(false);
        setSelectedCategory('');
        setAmount('');
        setDescription('');
        setEditingId(null);
    };

    const handleSave = async () => {
        try {
            Keyboard.dismiss();
        } catch (error) {
            console.log('Keyboard dismiss error:', error);
        }

        if (!selectedCategory || !amount) {
            Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        const numericAmount = parseMoney(amount);
        const categoryTag = expenseTags.find(tag => tag.name === selectedCategory);
        
        const newItem: BudgetItem = {
            id: editingId || Date.now().toString(),
            category: selectedCategory,
            amount: numericAmount,
            description: description.trim(),
            color: categoryTag?.color || '#6b7280',
        };

        let updatedItems: BudgetItem[];
        if (editingId) {
            updatedItems = budgetItems.map(item => 
                item.id === editingId ? newItem : item
            );
        } else {
            updatedItems = [...budgetItems, newItem];
        }

        setBudgetItems(updatedItems);
        await saveBudgetData(updatedItems);
        closeModal();
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn xóa kế hoạch này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedItems = budgetItems.filter(item => item.id !== id);
                        setBudgetItems(updatedItems);
                        await saveBudgetData(updatedItems);
                    },
                },
            ]
        );
    };

    const handleDeleteFromModal = async () => {
        if (!editingId) return;
        
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa kế hoạch này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedItems = budgetItems.filter(item => item.id !== editingId);
                        setBudgetItems(updatedItems);
                        await saveBudgetData(updatedItems);
                        closeModal();
                    },
                },
            ]
        );
    };

    const handleItemPress = (item: BudgetItem) => {
        const currentCount = clickCount[item.id] || 0;
        const newCount = currentCount + 1;
        
        setClickCount(prev => ({
            ...prev,
            [item.id]: newCount
        }));

        if (newCount >= 5) {
            setClickCount(prev => ({
                ...prev,
                [item.id]: 0
            }));
            openModal(undefined, item);
        }

        setTimeout(() => {
            setClickCount(prev => ({
                ...prev,
                [item.id]: 0
            }));
        }, 2000);
    };

    const getTotalBudget = () => {
        return budgetItems.reduce((sum, item) => sum + item.amount, 0);
    };

    const getRemainingBudget = () => {
        const totalBudget = getTotalBudget();
        return walletBalance - totalBudget;
    };

    const getBudgetStatus = () => {
        const remaining = getRemainingBudget();
        if (remaining > 0) {
            return {
                text: `Còn lại: ${formatMoney(remaining)}đ`,
                color: '#16a34a'
            };
        } else if (remaining < 0) {
            return {
                text: `Vượt quá: ${formatMoney(Math.abs(remaining))}đ`,
                color: '#ef4444'
            };
        } else {
            return {
                text: 'Vừa đúng ngân sách',
                color: '#eab308'
            };
        }
    };

    const renderBudgetItem = ({ item }: { item: BudgetItem }) => (
        <TouchableOpacity 
            style={styles.budgetItem}
            onLongPress={() => handleDelete(item.id)}
            onPress={() => handleItemPress(item)}
        >
            <View style={styles.budgetItemLeft}>
                <View style={[styles.categoryColor, { backgroundColor: item.color }]} />
                <View style={styles.budgetItemInfo}>
                    <Text style={styles.budgetItemCategory}>{item.category}</Text>
                    {item.description ? (
                        <Text style={styles.budgetItemDescription}>{item.description}</Text>
                    ) : null}
                </View>
            </View>
            <View style={styles.budgetItemRight}>
                <Text style={styles.budgetItemAmount}>{formatMoney(item.amount)}đ</Text>
                {clickCount[item.id] > 0 && (
                    <Text style={styles.clickIndicator}>
                        {clickCount[item.id]}/5
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderCategoryButton = (tag: { name: string; color: string }) => {
        const existingItem = budgetItems.find(item => item.category === tag.name);
        return (
            <TouchableOpacity
                key={tag.name}
                style={[styles.categoryButton, { borderColor: tag.color }]}
                onPress={() => openModal(tag.name, existingItem)}
            >
                <View style={[styles.categoryColor, { backgroundColor: tag.color }]} />
                <Text style={styles.categoryButtonText}>{tag.name}</Text>
                {existingItem && <Text style={styles.categoryAmount}>✓</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <Text style={styles.title}>
                    Kế hoạch chi tiêu tháng {selectedMonth.slice(5, 7)}/{selectedMonth.slice(0, 4)}
                </Text>
                
                <Text style={styles.totalWallet}>
                    Tổng số tiền khả dụng ví: {formatMoney(walletBalance)}đ
                </Text>
                
                <Text style={styles.totalBudget}>
                    Tổng dự trù: {formatMoney(getTotalBudget())}đ
                </Text>
                
                <Text style={[styles.budgetStatus, { color: getBudgetStatus().color }]}>
                    {/* {getBudgetStatus().text} */}
                </Text>
            </View>

            <View style={styles.categoriesContainer}>
                <Text style={styles.sectionTitle}>Chọn danh mục để lập kế hoạch:</Text>
                <View style={styles.categoriesGrid}>
                    {expenseTags.map(renderCategoryButton)}
                </View>
            </View>

            <View style={styles.budgetListContainer}>
                <Text style={styles.sectionTitle}>Kế hoạch đã tạo:</Text>
                {budgetItems.length > 0 ? (
                    <View style={styles.flatListWrapper}>
                        {budgetItems.map((item) => (
                            <View key={item.id}>
                                {renderBudgetItem({ item })}
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyText}>Chưa có kế hoạch chi tiêu nào.</Text>
                )}
            </View>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <KeyboardAvoidingView 
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback onPress={() => {}}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>
                                        {editingId ? 'Chỉnh sửa kế hoạch' : 'Thêm kế hoạch chi tiêu'}
                                    </Text>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Danh mục:</Text>
                                        <View style={styles.selectedCategoryContainer}>
                                            <View style={[
                                                styles.categoryColor, 
                                                { backgroundColor: expenseTags.find(tag => tag.name === selectedCategory)?.color || '#6b7280' }
                                            ]} />
                                            <Text style={styles.selectedCategoryText}>{selectedCategory}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Số tiền (VNĐ):</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={amount}
                                            onChangeText={handleAmountChange}
                                            placeholder="Nhập số tiền"
                                            keyboardType="numeric"
                                            returnKeyType="next"
                                            onSubmitEditing={Keyboard.dismiss}
                                        />
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Mô tả (tùy chọn):</Text>
                                        <TextInput
                                            style={[styles.input, styles.textArea]}
                                            value={description}
                                            onChangeText={setDescription}
                                            placeholder="Nhập mô tả chi tiết..."
                                            multiline
                                            numberOfLines={3}
                                            returnKeyType="done"
                                            onSubmitEditing={Keyboard.dismiss}
                                        />
                                    </View>

                                    <View style={styles.modalButtons}>
                                        <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                                            <Text style={styles.cancelButtonText}>Hủy</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                            <Text style={styles.saveButtonText}>
                                                {editingId ? 'Cập nhật' : 'Thêm'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {editingId && (
                                        <TouchableOpacity 
                                            style={styles.deleteButton} 
                                            onPress={handleDeleteFromModal}
                                        >
                                            <Text style={styles.deleteButtonText}>Xóa kế hoạch này</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 8,
    },
    totalWallet: {
        fontSize: 16,
        color: '#16a34a',
        fontWeight: '600',
        marginBottom: 4,
    },
    totalBudget: {
        fontSize: 16,
        color: '#2563eb',
        fontWeight: '600',
        marginBottom: 4,
    },
    budgetStatus: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
    },
    categoriesContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '48%',
        padding: 12,
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    categoryColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    categoryButtonText: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },
    categoryAmount: {
        fontSize: 16,
        color: '#22c55e',
        fontWeight: 'bold',
    },
    budgetListContainer: {
        marginBottom: 24,
    },
    flatListWrapper: {},
    budgetItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 8,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    budgetItemLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    budgetItemInfo: {
        flex: 1,
    },
    budgetItemCategory: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a365d',
    },
    budgetItemDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    budgetItemRight: {
        alignItems: 'flex-end',
    },
    budgetItemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2563eb',
    },
    clickIndicator: {
        fontSize: 12,
        color: '#f97316',
        fontWeight: 'bold',
        marginTop: 2,
        backgroundColor: '#fef3c7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    emptyText: {
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 16,
        marginTop: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        width: screenWidth,
        height: screenHeight,
    },
    modalContent: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 12,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        textAlign: 'center',
        marginBottom: 20,
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    selectedCategoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    selectedCategoryText: {
        fontSize: 16,
        color: '#374151',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 16,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginRight: 8,
    },
    cancelButtonText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '600',
    },
    saveButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#2563eb',
        marginLeft: 8,
    },
    saveButtonText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
    deleteButton: {
        width: '100%',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#ef4444',
        alignItems: 'center',
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
    },
});

export default BudgetPlan;