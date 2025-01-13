// headerOptions.js
import React from 'react';
import {TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {useNotification} from "../context/NotificationContext";

// Create a separate component for the notification button
const NotificationButton = ({navigation}) => {
    const {totalUnreadCount} = useNotification();

    const handleNotPress = () => {
        navigation.navigate("NotificationsScreen");
    };

    return (
        <TouchableOpacity
            onPress={handleNotPress}
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 20,
            }}
        >
            <View>
                <Ionicons name="notifications-outline" size={24} color="black"/>
                {totalUnreadCount > 0 && (
                    <View
                        style={{
                            position: "absolute",
                            right: -3,
                            top: -3,
                            backgroundColor: "red",
                            borderRadius: 6,
                            width: 10,
                            height: 10,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    />
                )}
            </View>
        </TouchableOpacity>
    );
};

// Modify the header options to use the component
export const defaultHeaderOptions = ({navigation, route}) => ({
    headerTitle: route.name,
    headerStyle: {
        backgroundColor: "#fff",
        borderBottomWidth: 3,
    },
    headerTitleAlign: "center",
    headerRight: () => <NotificationButton navigation={navigation}/>,
});