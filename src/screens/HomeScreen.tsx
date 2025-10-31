import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const packageJson = require('../../package.json');
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Routes, RootStackParamList } from '../navigations/Routes';
import HeaderMain from '../components/HeaderMain';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getCurrentDate = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

type StartScreenNavigationProp = StackNavigationProp<RootStackParamList, typeof Routes.HOME>;

const HomeScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<StartScreenNavigationProp>();
        
    const handleDayPress = (day: { dateString: string }) => {

        console.log('Selected day:', day.dateString);
        // Navigation to AddEventScreen can be handled here
        navigation.navigate(Routes.ADD_EVENT, { selectedDate: day.dateString });
    };
    
    return (
        <SafeAreaView style={styles.container}>
            <HeaderMain currentTitle="Welcome to" />
            <ScrollView style={[styles.content, { marginTop: insets.top + 80}]} showsVerticalScrollIndicator={false}>
                {/* Quick Stats */}
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Bạn sẽ làm gì hôm nay? </Text>

                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={{
                            [getCurrentDate()]: {
                                selected: true,
                                selectedColor: '#1a365d',
                            },
                        }}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            textSectionTitleColor: '#1a365d',
                            selectedDayBackgroundColor: '#1a365d',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#00adf5',
                            dayTextColor: '#2d4150',
                            textDisabledColor: '#d9e1e8',
                            dotColor: '#00adf5',
                            selectedDotColor: '#ffffff',
                            arrowColor: '#1a365d',
                            disabledArrowColor: '#d9e1e8',
                            monthTextColor: '#1a365d',
                            indicatorColor: '#1a365d',
                            textDayFontFamily: 'System',
                            textMonthFontFamily: 'System',
                            textDayHeaderFontFamily: 'System',
                            textDayFontWeight: '400',
                            textMonthFontWeight: 'bold',
                            textDayHeaderFontWeight: '600',
                            textDayFontSize: 16,
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 14,
                        }}
                        style={styles.calendar}
                    />

                    <Text style={styles.instruction}>
                        Nhấn vào ngày để thêm chi tiêu
                    </Text>
                </View>


                {/* Add space for bottom tab bar */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 16,
        textAlign: 'center',
    },
    calendar: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        marginBottom: 20,
    },
    instruction: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    bottomSpacing: {
        height: 100, // Space for bottom tab bar
    },
});

export default HomeScreen;