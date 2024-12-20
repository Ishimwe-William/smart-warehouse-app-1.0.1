import React, { createContext, useState, useContext, useEffect } from "react";
import { getDatabase, ref, onValue } from "firebase/database";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadNotifications, setUnreadNotifications] = useState(false);

    useEffect(() => {
        const db = getDatabase();
        const notificationsRef = ref(db, "warehouse/notification");

        // Real-time listener to listen for changes in notifications
        const unsubscribe = onValue(notificationsRef, (snapshot) => {
            if (snapshot.exists()) {
                const notifications = snapshot.val();

                // Check if there are any unread notifications
                const hasUnread = Object.values(notifications).some(notification => !notification.read);
                setUnreadNotifications(hasUnread);
            } else {
                // If no notifications exist
                setUnreadNotifications(false);
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, []);

    return (
        <NotificationContext.Provider value={{ unreadNotifications }}>
            {children}
        </NotificationContext.Provider>
    );
};

// Custom hook to use the notification context
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};
