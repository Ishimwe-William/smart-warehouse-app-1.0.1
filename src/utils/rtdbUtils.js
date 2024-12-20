import {onValue, ref, set, push, query, orderByChild, equalTo, limitToLast, get} from "firebase/database";
import {rtdb} from "../config/firebaseConfig";

const THRESHOLDS_PATH = '/warehouse/thresholds';

export const listenToValue = (path, callback) => {
    const dbRef = ref(rtdb, path);
    return onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        } else {
            callback(null);
        }
    });
};

export const saveNotificationToFirebase = async (path, notification) => {
    try {
        // Remove the trailing slash from the path
        const typeSpecificPath = path.replace(/\/$/, '');
        const notificationRef = ref(rtdb, typeSpecificPath);

        // Check for recent notifications of the same type
        const recentQuery = query(
            notificationRef,
            orderByChild('type'),
            equalTo(notification.type),
            limitToLast(1)
        );

        const snapshot = await get(recentQuery);

        // Default to saving the notification
        let shouldSaveNotification = true;

        if (snapshot.exists()) {
            const lastNotification = Object.values(snapshot.val())[0];

            // Check if ALL notification properties are the same
            const isIdenticalNotification =
                lastNotification.type === notification.type &&
                lastNotification.message === notification.message &&
                lastNotification.value === notification.value;

            // If notifications are identical, don't save
            if (isIdenticalNotification) {
                shouldSaveNotification = false;
            }
        }

        if (shouldSaveNotification) {
            // Create a unique key
            const newNotificationKey = push(notificationRef).key;

            // Construct the full path with a unique key
            const fullPath = `${typeSpecificPath}/${newNotificationKey}`;
            const finalNotificationRef = ref(rtdb, fullPath);

            await set(finalNotificationRef, {
                ...notification,
                read: false,
                timestamp: new Date().toISOString(),
            });
        }
    } catch (error) {
        console.error("Error saving notification:", error);
    }
};

export const markNotificationAsRead = async (path, notificationId) => {
    try {
        const notificationRef = ref(rtdb, `${path}/${notificationId}`);
        await set(notificationRef, {read: true});
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

export const fetchNotifications = async (path, setNotifications) => {
    const notificationRef = ref(rtdb, path);
    const snapshot = await get(notificationRef);
    const notificationsData = snapshot.val();
    if (notificationsData) {
        const notificationsArray = Object.keys(notificationsData).map((key) => ({
            id: key,
            ...notificationsData[key],
        }));
        setNotifications(notificationsArray);
    }
    ;
};

export const fetchThresholds = async () => {
    const dbRef = ref(rtdb, THRESHOLDS_PATH);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null; // Return null if no thresholds exist
    } catch (error) {
        console.error(`Error fetching thresholds from ${THRESHOLDS_PATH}:`, error);
        return null;
    }
};

export const updateThresholds = async (thresholds) => {
    const dbRef = ref(rtdb, THRESHOLDS_PATH);
    try {
        await set(dbRef, thresholds);
    } catch (error) {
        return console.error(`Error updating thresholds at ${THRESHOLDS_PATH}:`, error);
    }
};

export const fetchMostRecentData = async (path) => {
    const dbRef = ref(rtdb, path);
    try {
        const snapshot = await get(dbRef);
        if (snapshot.exists()) {
            const data = snapshot.val();

            // Extract entries and sort by key (timestamp in descending order)
            const sortedEntries = Object.entries(data).sort((a, b) =>
                new Date(b[0]) - new Date(a[0])
            );

            // Get the most recent entry
            const [mostRecentKey, mostRecentValue] = sortedEntries[0];
            return {
                id: mostRecentKey,
                ...mostRecentValue,
            };
        }
        return null; // Return null if no data exists
    } catch (error) {
        console.error(`Error fetching recent data from ${path}:`, error);
        return null;
    }
};

export const updateValue = async (path, value) => {
    const dbRef = ref(rtdb, path);
    try {
        await set(dbRef, value);
    } catch (error) {
        return console.error(`Error updating ${path}:`, error);
    }
};


export const fetchFilteredData = async (path, startTime, endTime) => {
    const dbRef = ref(rtdb, path);
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.entries(data)
            .filter(([key, value]) => {
                const createdAt = new Date(`${value.createdAt_date}T${value.createdAt_time}`);
                return createdAt >= startTime && createdAt <= endTime;
            })
            .map(([key, value]) => ({
                id: key,
                createdAt: `${value.createdAt_date} ${value.createdAt_time}`,
                temperature: value.temperature,
                humidity: value.humidity,
            }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return [];
};

