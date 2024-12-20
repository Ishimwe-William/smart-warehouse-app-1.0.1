import React, { createContext, useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import NetInfo from '@react-native-community/netinfo';

export const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        // Network state change handler
        const handleNetworkStateChange = (state) => {
            const { isConnected } = state;
            setIsConnected(isConnected);

            // Display toast notification
            Toast.show({
                type: isConnected ? "success" : "error",
                text1: isConnected ? "Network Connected" : "Network Disconnected",
                text2: isConnected
                    ? "You are back online."
                    : "Please check your internet connection.",
                visibilityTime: 3000,
                autoHide: true,
                position: "top",
            });

            // Log the event
            if (__DEV__) {
                console.log(
                    `Network ${isConnected ? "Connected" : "Disconnected"} at ${new Date().toLocaleString()}`
                );
            }
        };

        // Subscribe to network state updates
        const unsubscribe = NetInfo.addEventListener(handleNetworkStateChange);

        // Perform an initial check
        NetInfo.fetch().then(handleNetworkStateChange);

        // Cleanup subscription on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <NetworkContext.Provider value={{ isConnected }}>
            {children}
            <Toast />
        </NetworkContext.Provider>
    );
};
