import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveDataEventDayToStore = async (date: string, event: any) => {
    try {
        const currentTime = new Date();
        const time = currentTime.toTimeString().slice(0, 5).replace(':', ''); // hhmm
        const key = `event_${date}`;

        const existingData = await AsyncStorage.getItem(key);
        const parsedData = existingData ? JSON.parse(existingData) : [];

        // Lấy tên profile_name từ AsyncStorage
        let userPay = '';
        try {
            const profileName = await AsyncStorage.getItem('profile_name');
            if (profileName) userPay = profileName;
        } catch {}

        const newEvent = { ...event, time, userPay };
        parsedData.push(newEvent);

        await AsyncStorage.setItem(key, JSON.stringify(parsedData));
        console.log('Event saved successfully:', newEvent);
    } catch (error) {
        console.error('Error saving event:', error);
    }
};

export const getDataEventsDayFromStore = async (date: string) => {
    try {
        const key = `event_${date}`;
        const data = await AsyncStorage.getItem(key);
        const events = data ? JSON.parse(data) : [];

        // Sort events by time in descending order
        events.sort((a: any, b: any) => b.time.localeCompare(a.time));

        // Format date and time for each event
        const formattedEvents = events.map((event: any) => {
            const dateTimePay = `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)} ${event.time.slice(0, 2)}:${event.time.slice(2, 4)}`;
            return { ...event, dateTimePay };
        });

        return [{ date, events: formattedEvents }]; // Wrap events in the expected structure
    } catch (error) {
        console.error('Error retrieving events:', error);
        return [];
    }
};

export const getDataEventsMonthFromStore = async (date: string) => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const eventKeys = keys.filter((key) => key.startsWith('event_'));
        const month = date.slice(0, 7); // yyyy-MM
        const events = await AsyncStorage.multiGet(eventKeys);
        const monthEvents = events.flatMap(([key, value]) => {
            const eventDate = key.replace('event_', '');
            if (!eventDate.startsWith(month)) return [];
            const parsedEvents = value ? JSON.parse(value) : [];
            return parsedEvents.map((event: any) => ({
                ...event,
                date: eventDate,
                formattedTime: `${eventDate.slice(8, 10)}/${eventDate.slice(5, 7)}/${eventDate.slice(0, 4)} ${event.time.slice(0, 2)}:${event.time.slice(2, 4)}`,
            }));
        });
        // Sắp xếp giảm dần theo formattedTime
        monthEvents.sort((a, b) => b.formattedTime.localeCompare(a.formattedTime));
        return monthEvents;
    } catch (error) {
        console.error('Error retrieving month events:', error);
        return [];
    }
};

export const getDataAllEventsFromStore = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const eventKeys = keys.filter((key) => key.startsWith('event_'));

        const events = await AsyncStorage.multiGet(eventKeys);
        const allEvents = events.flatMap(([key, value]) => {
            const date = key.replace('event_', '');
            const parsedEvents = value ? JSON.parse(value) : [];
            return parsedEvents.map((event: any) => ({
                ...event,
                date,
                formattedTime: `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)} ${event.time.slice(0, 2)}:${event.time.slice(2, 4)}`,
            }));
        });
        // Sắp xếp giảm dần theo formattedTime (mới nhất trước)
        allEvents.sort((a, b) => b.formattedTime.localeCompare(a.formattedTime));
        return allEvents;
    } catch (error) {
        console.error('Error retrieving all events:', error);
        return [];
    }
};

// Ví dụ dữ liệu mockup cho các hàm:
//
// Dữ liệu event lưu trong AsyncStorage với key: event_YYYY-MM-DD
// [
//   {
//     "name": "Ăn sáng",
//     "amount": 30000,
//     "category": "Ăn uống",
//     "time": "0730"
//   },
//   {
//     "name": "Cafe",
//     "amount": 25000,
//     "category": "Giải trí",
//     "time": "0900"
//   }
// ]
//
// Kết quả trả về của getDataEventsDayFromStore('2025-10-30'):
// [
//   {
//     date: '2025-10-30',
//     events: [
//       {
//         name: 'Cafe',
//         amount: 25000,
//         category: 'Giải trí',
//         time: '0900',
//         dateTimePay: '30/10/2025 09:00'
//       },
//       {
//         name: 'Ăn sáng',
//         amount: 30000,
//         category: 'Ăn uống',
//         time: '0730',
//         dateTimePay: '30/10/2025 07:30'
//       }
//     ]
//   }
// ]
//
// Kết quả trả về của getDataAllEventsFromStore():
// [
//   {
//     name: 'Cafe',
//     amount: 25000,
//     category: 'Giải trí',
//     time: '0900',
//     date: '2025-10-30',
//     formattedTime: '30/10/2025 09:00'
//     userPay: 'Duong'
//   },
//   {
//     name: 'Ăn sáng',
//     amount: 30000,
//     category: 'Ăn uống',
//     time: '0730',
//     date: '2025-10-30',
//     formattedTime: '30/10/2025 07:30'
//     userPay: 'Duong'
//   }
// ]