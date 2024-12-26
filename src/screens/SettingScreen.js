import {useEffect, useLayoutEffect, useState} from "react";
import {StyleSheet, Switch, Text, View} from "react-native";
import {listenToValue, updateValue} from "../utils/rtdbUtils";
import {useNavigation} from "@react-navigation/native";
import {styles as baseStyles} from "../utils/styles";

const switch1Path = "/warehouse/switches/switch1";

export default function SettingsScreen() {
    const [systemState, setSystemState] = useState(false);
    const navigation = useNavigation()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Warehouse System Control",
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

    const handleToggleSystemState = () => {
        const newState = !systemState;
        setSystemState(newState);
        updateValue(switch1Path, newState);
    };

    return (
        <View style={[baseStyles.row, styles.container]}>
            <Text style={baseStyles.subtitle}>Current System State: {systemState ? "On" : "Off"}</Text>
            <Switch onValueChange={handleToggleSystemState} value={systemState}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
