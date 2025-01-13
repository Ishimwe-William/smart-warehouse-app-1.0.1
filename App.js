import {StatusBar} from "expo-status-bar";
import {AuthProvider} from "./src/context/AuthContext";
import {MainNavigation} from "./src/navigation/MainNavigator";
import React from "react";
import {NotificationProvider} from "./src/context/NotificationContext";
import {NetworkProvider} from "./src/context/NetworkContext";

export default function App() {
    return (
        <NetworkProvider>
            <AuthProvider>
                <NotificationProvider>
                    <MainNavigation/>
                    <StatusBar style="dark"/>
                </NotificationProvider>
            </AuthProvider>
        </NetworkProvider>
    );
}