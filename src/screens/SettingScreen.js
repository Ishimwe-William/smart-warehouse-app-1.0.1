import {useState, useEffect} from "react";
import {StyleSheet, Switch, Text, TouchableOpacity, View} from "react-native";
import {listenToValue, updateValue} from "../utils/rtdbUtils";
import {MyButton} from "../components/MyButton";
import {useLayoutEffect} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useNavigation} from "@react-navigation/native";

const switch1Path = "/warehouse/switches/switch1";

export default function SettingsScreen() {
    const [systemState, setSystemState] = useState(false);
    const navigation = useNavigation()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Settings",
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
        <View style={styles.container}>
            <Text>Settings Screen</Text>
            <Text>Current System State: {systemState ? "On" : "Off"}</Text>
            <Switch onValueChange={handleToggleSystemState} value={systemState}/>
            <MyButton HandleOnPress={handleToggleSystemState} ButtonText={"Toggle System State"}/>
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
