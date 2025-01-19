import {equalTo, get, limitToLast, onValue, orderByChild, push, query, ref, remove, set} from "firebase/database";
import {rtdb} from "../config/firebaseConfig";

const THRESHOLDS_PATH = '/warehouse/thresholds';
const GENERAL_NOTIFICATIONS_PATH = '/warehouse/notifications/general';
const getUserNotificationsPath = (userId) => `/warehouse/notifications/users/${userId}`;

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

            // Extract entries and sort by key (formatted as YYYY-MM-DD_HH:mm:ss) in descending order
            const sortedEntries = Object.entries(data).sort((a, b) =>
                new Date(b[0].replace("_", "T")) - new Date(a[0].replace("_", "T"))
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
        // return console.error(`Error updating ${path}:`, error);
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

// Add this new function to handle notification deletion
export const deleteNotification = async (notificationId, userId, isGeneral = false) => {
    try {
        const basePath = isGeneral ? GENERAL_NOTIFICATIONS_PATH : getUserNotificationsPath(userId);
        const notificationRef = ref(rtdb, `${basePath}/${notificationId}`);

        // Check if notification exists before attempting deletion
        const snapshot = await get(notificationRef);
        if (snapshot.exists()) {
            await remove(notificationRef);
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
};

// Add this function to delete multiple notifications
export const deleteMultipleNotifications = async (notificationIds, userId) => {
    try {
        const promises = notificationIds.map(({id, isGeneral}) =>
            deleteNotification(id, userId, isGeneral)
        );
        await Promise.all(promises);
        return true;
    } catch (error) {
        console.error("Error deleting multiple notifications:", error);
        throw error;
    }
};

// Modified to handle both general and user-specific notifications
export const saveNotificationToFirebase = async (notification, userId = null) => {
    try {
        // Determine if this is a general or user-specific notification
        const basePath = userId ? getUserNotificationsPath(userId) : GENERAL_NOTIFICATIONS_PATH;
        const notificationRef = ref(rtdb, basePath);

        // Check for recent notifications of the same type
        const recentQuery = query(
            notificationRef,
            orderByChild('type'),
            equalTo(notification.type),
            limitToLast(1)
        );

        const snapshot = await get(recentQuery);
        let shouldSaveNotification = true;

        if (snapshot.exists()) {
            const lastNotification = Object.values(snapshot.val())[0];
            const isIdenticalNotification =
                lastNotification.type === notification.type &&
                lastNotification.message === notification.message &&
                lastNotification.value === notification.value;

            if (isIdenticalNotification) {
                shouldSaveNotification = false;
            }
        }

        if (shouldSaveNotification) {
            const newNotificationKey = push(notificationRef).key;
            const fullPath = `${basePath}/${newNotificationKey}`;
            const finalNotificationRef = ref(rtdb, fullPath);

            await set(finalNotificationRef, {
                ...notification,
                readBy: {}, // Object to track which users have read it
                timestamp: new Date().toISOString(),
            });
        }
    } catch (error) {
        console.error("Error saving notification:", error);
    }
};

// Modified to track read status per user
export const markNotificationAsRead = async (notificationId, userId, isGeneral = false) => {
    try {
        const basePath = isGeneral ? GENERAL_NOTIFICATIONS_PATH : getUserNotificationsPath(userId);
        const notificationRef = ref(rtdb, `${basePath}/${notificationId}/readBy/${userId}`);
        await set(notificationRef, true);
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

// Modified to fetch both general and user-specific notifications
export const fetchAllNotifications = async (userId) => {
    try {
        // Fetch general notifications
        const generalRef = ref(rtdb, GENERAL_NOTIFICATIONS_PATH);
        const generalSnapshot = await get(generalRef);

        // Fetch user-specific notifications
        const userRef = ref(rtdb, getUserNotificationsPath(userId));
        const userSnapshot = await get(userRef);

        const notifications = [];

        // Process general notifications
        if (generalSnapshot.exists()) {
            Object.entries(generalSnapshot.val()).forEach(([key, value]) => {
                notifications.push({
                    id: key,
                    ...value,
                    isGeneral: true,
                    read: value.readBy?.[userId] || false
                });
            });
        }

        // Process user-specific notifications
        if (userSnapshot.exists()) {
            Object.entries(userSnapshot.val()).forEach(([key, value]) => {
                notifications.push({
                    id: key,
                    ...value,
                    isGeneral: false,
                    read: value.readBy?.[userId] || false
                });
            });
        }

        // Sort by timestamp, newest first
        return notifications.sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
};
