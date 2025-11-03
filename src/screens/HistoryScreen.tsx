import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, TouchableOpacity, Alert, FlatList, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import HeaderMain from '../components/HeaderMain';
import HistoryItem from '../components/HistoryItem';
import { getDataAllEventsFromStore, updateEventInStore } from '../services/EventStorageService';
import packageJson from '../../package.json';

interface ExpenseTag {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const HistoryScreen: React.FC = () => {
    const [allEvents, setAllEvents] = useState<any[]>([]);
    const [groupedHistory, setGroupedHistory] = useState<Record<string, Record<string, any[]>>>({});
    const [selectedFilter, setSelectedFilter] = useState<string>('Tất cả');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        amount: '',
        category: '',
        detail: ''
    });
    const insets = useSafeAreaInsets();

    const expenseTags: ExpenseTag[] = [
        { id: 'all', name: 'Tất cả', icon: 'list', color: '#6b7280' },
        { id: '1', name: 'Ăn uống', icon: 'utensils', color: '#ef4444' },
        { id: '2', name: 'Đi lại', icon: 'car-side', color: '#f97316' },
        { id: '3', name: 'Mua sắm', icon: 'shopping-bag', color: '#eab308' },
        { id: '4', name: 'Giải trí', icon: 'gamepad', color: '#22c55e' },
        { id: '5', name: 'Y tế', icon: 'heart-pulse', color: '#06b6d4' },
        { id: '6', name: 'Học tập', icon: 'book', color: '#3b82f6' },
        { id: '7', name: 'Nhà cửa', icon: 'house', color: '#8b5cf6' },
        { id: '8', name: 'Khác', icon: 'plus', color: '#6b7280' },
    ];

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [selectedFilter, allEvents]);

    const fetchHistory = async () => {
        const events = await getDataAllEventsFromStore();
        setAllEvents(events);
    };

    const applyFilter = () => {
        let filteredEvents = allEvents;
        
        if (selectedFilter !== 'Tất cả') {
            if (selectedFilter === 'Khác') {
                // Filter to show only expenses that don't belong to the main 7 categories
                const mainCategories = ['Ăn uống', 'Đi lại', 'Mua sắm', 'Giải trí', 'Y tế', 'Học tập', 'Nhà cửa'];
                filteredEvents = allEvents.filter(event => 
                    !mainCategories.includes(event.tag) && 
                    !mainCategories.includes(event.category) && 
                    !mainCategories.includes(event.name)
                );
            } else {
                // Filter for specific category
                filteredEvents = allEvents.filter(event => 
                    event.tag === selectedFilter || event.category === selectedFilter || event.name === selectedFilter
                );
            }
        }

        // Nhóm theo tháng, sau đó theo ngày
        const groupedByMonth = filteredEvents.reduce((acc: Record<string, Record<string, any[]>>, event) => {
            const monthYear = event.date.slice(0, 7); // yyyy-MM
            const fullDate = event.date; // yyyy-MM-dd
            const dayDate = `${event.date.slice(8, 10)}/${event.date.slice(5, 7)}/${event.date.slice(0, 4)}`; // dd/MM/yyyy
            
            if (!acc[monthYear]) {
                acc[monthYear] = {};
            }
            if (!acc[monthYear][dayDate]) {
                acc[monthYear][dayDate] = [];
            }
            acc[monthYear][dayDate].push(event);
            return acc;
        }, {});
        setGroupedHistory(groupedByMonth);
    };

    const handleFilterPress = (tagName: string) => {
        setSelectedFilter(tagName);
    };

    const handleEditPress = (event: any) => {
        setEditingEvent(event);
        setEditForm({
            name: event.name || event.tag,
            amount: event.amount?.toString() || '',
            category: event.category || event.tag,
            detail: event.detail || ''
        });
        setModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editingEvent) return;

        const updatedEvent = {
            name: editForm.name,
            amount: parseInt(editForm.amount) || 0,
            category: editForm.category,
            detail: editForm.detail,
            tag: editForm.category,
            formattedAmount: `${parseInt(editForm.amount) || 0}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ'
        };

        const success = await updateEventInStore(editingEvent, updatedEvent);
        
        if (success) {
            Alert.alert('Thành công', 'Cập nhật chi tiêu thành công!');
            setModalVisible(false);
            setEditingEvent(null);
            // Refresh the history
            await fetchHistory();
        } else {
            Alert.alert('Lỗi', 'Không thể cập nhật chi tiêu. Vui lòng thử lại.');
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingEvent(null);
    };

    const renderFilterTag = ({ item }: { item: ExpenseTag }) => (
        <TouchableOpacity
            style={[
                styles.filterTag,
                { borderColor: item.color },
                selectedFilter === item.name && { backgroundColor: item.color, borderColor: item.color }
            ]}
            onPress={() => handleFilterPress(item.name)}
            activeOpacity={0.7}
        >
            <FontAwesomeIcon
                icon={['fas', item.icon as any]}
                size={16}
                color={selectedFilter === item.name ? '#ffffff' : item.color}
            />
            <Text style={[
                styles.filterTagText,
                { color: selectedFilter === item.name ? '#ffffff' : item.color }
            ]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <HeaderMain currentTitle="Lịch sử chi tiêu" />
            
            {/* Filter Tags */}
            <View style={[styles.filterContainer, {marginTop: insets.top+100}]}>
                <FlatList
                    data={expenseTags}
                    renderItem={renderFilterTag}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterList}
                />
            </View>

            <ScrollView 
                contentContainerStyle={[styles.content, { 
                    paddingTop: 20,
                    paddingBottom: insets.bottom + 40 // Thêm padding bottom đủ lớn
                }]}
                showsVerticalScrollIndicator={false}
            >    
                {Object.keys(groupedHistory).length === 0 && (
                    <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 32 }}>
                        {selectedFilter === 'Tất cả' ? 'Chưa có lịch sử chi tiêu' : `Không có chi tiêu nào cho "${selectedFilter}"`}
                    </Text>
                )}
                {Object.keys(groupedHistory).map((monthYear) => (
                    <View key={monthYear} style={styles.monthSection}>
                        <Text style={styles.monthTitle}>Tháng {monthYear.slice(5, 7)}/{monthYear.slice(0, 4)}</Text>
                        {Object.keys(groupedHistory[monthYear]).map((dayDate) => (
                            <View key={dayDate} style={styles.daySection}>
                                <Text style={styles.dayTitle}>{dayDate}</Text>
                                {groupedHistory[monthYear][dayDate].map((event) => (
                                    <HistoryItem
                                        key={`${event.date}${event.time}`}
                                        eventName={event.tag}
                                        tag={event.tag}
                                        detail={event.detail}
                                        amount={event.formattedAmount}
                                        dateTimePay={event.dateTimePay || event.formattedTime}
                                        userPay={event.userPay}
                                        onEditPress={handleEditPress}
                                        eventData={event}
                                    />
                                ))}
                            </View>
                        ))}
                    </View>
                ))}
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={closeModal}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Chỉnh sửa chi tiêu</Text>
                            
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tên chi tiêu:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={editForm.name}
                                    onChangeText={(text) => setEditForm({...editForm, name: text})}
                                    placeholder="Nhập tên chi tiêu"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Số tiền:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={editForm.amount}
                                    onChangeText={(text) => setEditForm({...editForm, amount: text})}
                                    placeholder="Nhập số tiền"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Danh mục:</Text>
                                <TextInput
                                    style={styles.textInput}
                                    value={editForm.category}
                                    onChangeText={(text) => setEditForm({...editForm, category: text})}
                                    placeholder="Nhập danh mục"
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Ghi chú:</Text>
                                <TextInput
                                    style={[styles.textInput, styles.textArea]}
                                    value={editForm.detail}
                                    onChangeText={(text) => setEditForm({...editForm, detail: text})}
                                    placeholder="Nhập ghi chú"
                                    multiline={true}
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeModal}>
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveEdit}>
                                    <Text style={styles.saveButtonText}>Lưu</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingBottom: 16,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 16,
        // Bỏ flex: 1 để scroll hoạt động đúng
    },
    monthSection: {
        marginBottom: 24,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 12,
    },
    daySection: {
        marginBottom: 16,
        paddingLeft: 8,
    },
    dayTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748b',
        marginBottom: 8,
        paddingLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a365d',
        textAlign: 'center',
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    saveButton: {
        backgroundColor: '#1a365d',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    filterContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    filterList: {
        paddingBottom: 8,
    },
    filterTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginRight: 8,
    },
    filterTagText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default HistoryScreen;