import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveDataEventDayToStore = async (date: string, event: any) => {
    try {
        const currentTime = new Date();
        const time = currentTime.toTimeString().slice(0, 5).replace(':', ''); // hhmm
        const key = `event_${date}`;

        const existingData = await AsyncStorage.getItem(key);
        const parsedData = existingData ? JSON.parse(existingData) : [];

        const newEvent = { ...event, time };
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
    //logic get all events in month from storage
};

export const getDataAllEventsFromStore = async () => {
    //logic get all events from storage
};