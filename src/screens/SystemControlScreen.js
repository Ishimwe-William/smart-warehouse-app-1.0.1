import {useEffect, useLayoutEffect, useState} from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {listenToValue, saveNotificationToFirebase, updateValue} from "../utils/rtdbUtils";
import {useNavigation} from "@react-navigation/native";
import {styles as baseStyles} from "../utils/styles";

const switch1Path = "/warehouse/switches/switch1";

export default function SettingsScreen() {
    const [systemState, setSystemState] = useState(false);
    const navigation = useNavigation()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Warehouse System Control",
            headerLeft: undefined,
        });
    }, []);

    useEffect(() => {
        const unsubscribe = listenToValue(switch1Path, (status) => {
            if (status !== null) {
                setSystemState(status);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleToggleSystemState = async () => {
        const newState = !systemState;
        setSystemState(newState);
        await updateValue(switch1Path, newState);

        const notification = {
            type: `Warehouse state updated`,
            message: `System is Switched ${systemState ? "ON" : "OFF"}.`,
            timestamp: new Date().toISOString(),
        };
        await saveNotificationToFirebase(notification)
    };

    return (
        <View style={styles.container}>
            <Text style={baseStyles.subtitle}>System is {systemState ? "UP" : "DOWN"}</Text>
            {/*<Switch onValueChange={handleToggleSystemState} value={systemState}/>*/}
            <View style={styles.toggleButtonContainer}>
                <TouchableOpacity
                    disabled={systemState}
                    onPress={handleToggleSystemState}
                    style={[styles.toggleButton, systemState && styles.activeButton]}>
                    <Text style={[styles.buttonText, systemState && styles.activeButtonText]}>ON</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    disabled={!systemState}
                    onPress={handleToggleSystemState}
                    style={[styles.toggleButton, !systemState && styles.activeButton]}>
                    <Text style={[styles.buttonText, !systemState && styles.activeButtonText]}>OFF</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f9f9f9",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    toggleButtonContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#e0e0e0",
        borderRadius: 30,
        padding: 4,
        marginTop: 20,
        width: 200, // Adjust this as needed
    },
    toggleButton: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 30,
        backgroundColor: "#ccc",
        marginHorizontal: 2,
    },
    activeButton: {
        backgroundColor: "#4caf50", // Green for active
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#757575",
    },
    activeButtonText: {
        color: "#fff", // White text for active button
    },
});
