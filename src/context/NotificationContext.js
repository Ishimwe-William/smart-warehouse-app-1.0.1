// NotificationContext.js
import React, {createContext, useContext, useEffect, useState} from "react";
import {onValue, ref} from "firebase/database";
import {rtdb} from "../config/firebaseConfig";
import {useAuth} from "./AuthContext";

const NotificationContext = createContext();

const GENERAL_NOTIFICATIONS_PATH = '/warehouse/notifications/general';
const getUserNotificationsPath = (userId) => `/warehouse/notifications/users/${userId}`;

export const NotificationProvider = ({children}) => {
    const [unreadGeneralCount, setUnreadGeneralCount] = useState(0);
    const [unreadPersonalCount, setUnreadPersonalCount] = useState(0);
    const [hasNewAlerts, setHasNewAlerts] = useState(false);
    const {user} = useAuth();

    useEffect(() => {
        if (!user) {
            setUnreadGeneralCount(0);
            setUnreadPersonalCount(0);
            setHasNewAlerts(false);
            return;
        }

        // Listen to general notifications
        const generalRef = ref(rtdb, GENERAL_NOTIFICATIONS_PATH);
        const unsubscribeGeneral = onValue(generalRef, (snapshot) => {
            if (snapshot.exists()) {
                const notifications = snapshot.val();
                const unreadCount = Object.values(notifications).filter(
                    notification => !notification.readBy?.[user.uid]
                ).length;
                setUnreadGeneralCount(unreadCount);
                setHasNewAlerts(unreadCount > 0);
            }
        });

        // Listen to user-specific notifications
        const userRef = ref(rtdb, getUserNotificationsPath(user.uid));
        const unsubscribeUser = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const notifications = snapshot.val();
                const unreadCount = Object.values(notifications).filter(
                    notification => !notification.readBy?.[user.uid]
                ).length;
                setUnreadPersonalCount(unreadCount);
                setHasNewAlerts(prevState => prevState || unreadCount > 0);
            }
        });

        return () => {
            unsubscribeGeneral();
            unsubscribeUser();
        };
    }, [user]);

    const value = {
        unreadGeneralCount,
        unreadPersonalCount,
        totalUnreadCount: unreadGeneralCount + unreadPersonalCount,
        hasNewAlerts,
        clearNewAlertsFlag: () => setHasNewAlerts(false)
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
};