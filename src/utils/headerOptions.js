import {View, TouchableOpacity} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {useNotification} from "../context/NotificationContext";

export const headerOptions = ({navigation}) => {
    const {unreadNotifications} = useNotification();

    const handleNotPress = () => {
        navigation.navigate("NotificationsScreen");
    };

    return {
        headerTitle: "",
        headerStyle: {
            backgroundColor: "#fff",
            borderBottomWidth: 3,
        },
        headerTitleAlign: "center",
        headerRight: () => (
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
                    {unreadNotifications && (
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
        ),
    };
};
