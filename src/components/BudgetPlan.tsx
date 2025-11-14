import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

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
        // Chỉ cho phép số và dấu chấm
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
            // Editing mode
            setEditingId(item.id);
            setSelectedCategory(item.category);
            setAmount(formatMoney(item.amount));
            setDescription(item.description);
        } else {
            // Adding mode
            setEditingId(null);
            setSelectedCategory(category || '');
            setAmount('');
            setDescription('');
        }
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedCategory('');
        setAmount('');
        setDescription('');
        setEditingId(null);
    };

    const handleSave = async () => {
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
            // Update existing item
            updatedItems = budgetItems.map(item => 
                item.id === editingId ? newItem : item
            );
        } else {
            // Add new item
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

    const getTotalBudget = () => {
        return budgetItems.reduce((sum, item) => sum + item.amount, 0);
    };

    const renderBudgetItem = ({ item }: { item: BudgetItem }) => (
        <TouchableOpacity 
            style={styles.budgetItem}
            onLongPress={() => handleDelete(item.id)}
            onPress={() => openModal(undefined, item)}
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
            <Text style={styles.budgetItemAmount}>{formatMoney(item.amount)}đ</Text>
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
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Kế hoạch chi tiêu tháng {selectedMonth.slice(5, 7)}/{selectedMonth.slice(0, 4)}</Text>
                <Text style={styles.totalBudget}>
                    Tổng dự trù: {formatMoney(getTotalBudget())}đ
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
                    <FlatList
                        data={budgetItems}
                        renderItem={renderBudgetItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <Text style={styles.emptyText}>Chưa có kế hoạch chi tiêu nào.</Text>
                )}
            </View>

            {/* Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
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
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
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
    totalBudget: {
        fontSize: 16,
        color: '#2563eb',
        fontWeight: '600',
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
        flex: 1,
    },
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
    budgetItemAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2563eb',
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
});

export default BudgetPlan;