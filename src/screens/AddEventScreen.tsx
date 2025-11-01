import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    FlatList,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { RootStackParamList, Routes } from '../navigations/Routes';
import HeaderBack from '../components/HeaderBack';
import HistoryItem from '../components/HistoryItem';
import { getDataEventsDayFromStore, saveDataEventDayToStore } from '../services/EventStorageService';

type AddEventScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddEventScreen'>;
type AddEventScreenRouteProp = RouteProp<RootStackParamList, 'AddEventScreen'>;

interface ExpenseTag {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const AddEventScreen: React.FC = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<AddEventScreenNavigationProp>();
    const route = useRoute<AddEventScreenRouteProp>();
    const { selectedDate } = route.params;

    const [selectedTag, setSelectedTag] = useState<ExpenseTag | null>(null);
    const [amountInput, setAmountInput] = useState('');
    const [showEventInput, setShowEventInput] = useState(false);
    const [eventInput, setEventInput] = useState('');
    const [showDetailInput, setShowDetailInput] = useState(false);
    const [history, setHistory] = useState<{ date: string; events: { id: string, tag: string; amount: number; formattedAmount: string; detail: string; dateTimePay: string; userPay: string }[] }[]>([]);

    const scrollViewRef = useRef<ScrollView>(null);
    const eventInputRef = useRef<TextInput>(null);
    const detailInputRef = useRef<TextInput>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            const events = await getDataEventsDayFromStore(selectedDate);
            setHistory(events);
        };
        fetchHistory();
    }, [selectedDate]);

    const isSaveButtonEnabled = selectedTag && amountInput;
    const isThePastDay = new Date(selectedDate) < new Date(new Date().toDateString());

    const expenseTags: ExpenseTag[] = [
        { id: '1', name: 'Ăn uống', icon: 'utensils', color: '#ef4444' },
        { id: '2', name: 'Xăng xe', icon: 'gas-pump', color: '#f97316' },
        { id: '3', name: 'Mua sắm', icon: 'shopping-bag', color: '#eab308' },
        { id: '4', name: 'Giải trí', icon: 'gamepad', color: '#22c55e' },
        { id: '5', name: 'Y tế', icon: 'heart-pulse', color: '#06b6d4' },
        { id: '6', name: 'Học tập', icon: 'book', color: '#3b82f6' },
        { id: '7', name: 'Nhà cửa', icon: 'house', color: '#8b5cf6' },
        { id: '8', name: 'Khác', icon: 'plus', color: '#6b7280' },
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: string) => {
        const numericAmount = amount.replace(/[^\d]/g, '');
        if (numericAmount) {
            return numericAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
        }
        return '';
    };

    const generateSuggestions = (input: string) => {
        const numericInput = input.replace(/[^\d]/g, '');
        if (numericInput && numericInput.length > 0) {
            const suggestions = [];
            const baseNumber = parseInt(numericInput);

            // Suggestion 1: x1000 (thêm 3 số 0)
            if (baseNumber < 10000) {
                suggestions.push(formatCurrency((baseNumber * 1000).toString()));
            }

            // Suggestion 2: x10000 (thêm 4 số 0)
            if (baseNumber < 1000) {
                suggestions.push(formatCurrency((baseNumber * 10000).toString()));
            }

            // Suggestion 3: x100000 (thêm 5 số 0) - tối đa chục triệu
            if (baseNumber < 100) {
                suggestions.push(formatCurrency((baseNumber * 100000).toString()));
            }

            return suggestions.slice(0, 3);
        }
        return [];
    };

    const handleAmountChange = (text: string) => {
        const numericText = text.replace(/[^\d]/g, '');
        setAmountInput(numericText);
    };

    const handleTagPress = (tag: ExpenseTag) => {
        if (tag.id === '8') {
            setShowEventInput(true);
            setShowDetailInput(false);
            setSelectedTag(null);
        } else {
            setShowEventInput(false);
            setShowDetailInput(true);
            setEventInput('');
            setSelectedTag(tag);
        }
    };

    const handleEventInputChange = (text: string) => {
        setEventInput(text);
        setSelectedTag({ id: '8', name: text, icon: 'plus', color: '#6b7280' });
    };

    const handleEventInputFocus = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 300, animated: true });
        }, 100);
    };

    const handleDetailInputFocus = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 400, animated: true });
        }, 100);
    };

    const handleSave = async () => {
        if (!selectedTag) {
            Alert.alert('Lỗi', 'Vui lòng chọn loại chi tiêu');
            return;
        }

        if (!amountInput) {
            Alert.alert('Lỗi', 'Vui lòng nhập số tiền');
            return;
        }

        const newEvent = {
            id: Date.now().toString(), // Generate a unique ID
            tag: selectedTag.name,
            amount: parseInt(amountInput),
            formattedAmount: formatCurrency(amountInput),
            detail: eventInput,
        };

        try {
            await saveDataEventDayToStore(selectedDate, newEvent);
            const updatedHistory = await getDataEventsDayFromStore(selectedDate);
            setHistory(updatedHistory);
            Alert.alert(
                'Thành công',
                `Đã lưu chi tiêu ${selectedTag.name}: ${formatCurrency(amountInput)} cho ngày ${formatDate(selectedDate)}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.goBack();
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error saving event:', error);
            Alert.alert('Lỗi', 'Không thể lưu chi tiêu. Vui lòng thử lại.');
        }
    };

    const renderTag = ({ item }: { item: ExpenseTag }) => (
        <TouchableOpacity
            style={[
                styles.tagItem,
                { borderColor: item.color },
                selectedTag?.id === item.id && { backgroundColor: item.color + '20' },
            ]}
            onPress={() => handleTagPress(item)}
            activeOpacity={0.7}
        >
            <FontAwesomeIcon
                icon={['fas', item.icon as any]}
                size={20}
                color={item.color}
            />
            <Text style={[styles.tagText, { color: item.color }]}>
                {item.name}
            </Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
                <HeaderBack
                    title="Thêm chi tiêu"
                    onBackPress={() => navigation.goBack()}
                />

                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.content} 
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.dateSection}>
                        <Text style={styles.dateLabel}>Ngày chi tiêu:</Text>
                        <Text style={styles.dateValue}>{formatDate(selectedDate)}</Text>
                    </View>

                    {isThePastDay && (
                        <Text style={{ color: '#ef4444', textAlign: 'center' }}>
                            Bạn đang thêm chi tiêu cho ngày đã qua.
                        </Text>
                    )}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Chọn loại chi tiêu</Text>
                        <FlatList
                            data={expenseTags}
                            renderItem={renderTag}
                            keyExtractor={(item) => item.id}
                            numColumns={2}
                            scrollEnabled={false}
                            contentContainerStyle={styles.tagsContainer}
                        />
                    </View>
                    {isSaveButtonEnabled && (
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => {
                                setSelectedTag(null);
                                setAmountInput('');
                                setEventInput('');
                                setShowEventInput(false);
                                setShowDetailInput(false);
                            }}
                        >
                            <FontAwesomeIcon icon={['fas', 'redo']} size={16} color="#ef4444" />
                            <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                    )}
                    {showEventInput && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Nhập sự kiện</Text>
                            <TextInput
                                ref={eventInputRef}
                                style={styles.otherEventInput}
                                value={eventInput}
                                onChangeText={handleEventInputChange}
                                onFocus={handleEventInputFocus}
                                placeholder="Nhập sự kiện"
                            />
                        </View>
                    )}

                    {showDetailInput && (
                        <View style={styles.section}>
                            <TextInput
                                ref={detailInputRef}
                                style={styles.otherEventInput}
                                value={eventInput}
                                onChangeText={setEventInput}
                                onFocus={handleDetailInputFocus}
                                placeholder="Mô tả chi tiết (tùy chọn)"
                            />
                        </View>
                    )}

                    {(selectedTag || showEventInput) && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Nhập số tiền</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.amountInput}
                                    value={amountInput}
                                    onChangeText={handleAmountChange}
                                    placeholder="Nhập số tiền"
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                />
                                <Text style={styles.currencyLabel}>VNĐ</Text>
                            </View>

                            {amountInput && (
                                <Text style={styles.formattedAmount}>
                                    {formatCurrency(amountInput)}
                                </Text>
                            )}
                        </View>
                    )}

                    {isSaveButtonEnabled && (
                        <View style={styles.bottomSection}>
                            <TouchableOpacity
                                style={[styles.saveButton, !isSaveButtonEnabled && styles.saveButtonDisabled]}
                                onPress={handleSave}
                                activeOpacity={0.8}
                                disabled={!isSaveButtonEnabled}
                            >
                                <FontAwesomeIcon
                                    icon={['fas', 'save']}
                                    size={20}
                                    color="#ffffff"
                                />
                                <Text style={styles.saveButtonText}>Lưu chi tiêu</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={[styles.section, { marginBottom: insets.bottom + 80 }]}>
                        <Text style={styles.sectionTitle}>Lịch sử chi tiêu hôm nay</Text>
                        {history.length === 0 ? (
                            <Text style={styles.noEventToday}>Chưa có chi tiêu nào cho ngày này.</Text>
                        ) : (
                            history.map((item, index) => (
                                Array.isArray(item.events) && item.events.map((event) => (
                                    <HistoryItem
                                        key={`${event.dateTimePay}`}
                                        eventName={event.tag}
                                        tag={event.tag}
                                        detail={event.detail}
                                        amount={event.formattedAmount}
                                        dateTimePay={event.dateTimePay || ''}
                                        userPay={event.userPay}
                                    />
                                ))
                            ))
                        )}
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    dateSection: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    dateLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a365d',
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 12,
    },
    tagsContainer: {
        gap: 8,
    },
    tagItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 16,
        margin: 4,
        borderRadius: 12,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    tagText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        paddingVertical: 16,
        color: '#1a365d',
    },
    otherEventInput: {
        flex: 1,
        fontSize: 18,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 2,
    },
    currencyLabel: {
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    formattedAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#22c55e',
        textAlign: 'center',
        marginTop: 12,
    },
    bottomSection: {
        padding: 16,
        backgroundColor: '#f8fafc',
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a365d',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 3,
    },
    saveButtonDisabled: {
        backgroundColor: '#94a3b8',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginLeft: 8,
    },
    resetButton: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginTop: 16,
    },
    resetButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ef4444',
        marginLeft: 6,
    },
    noEventToday: {
        fontSize: 14,
        color: '#64748b',
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

export default AddEventScreen;