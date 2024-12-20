import {Text, TouchableOpacity, View} from "react-native";
import {styles} from "../utils/styles";
import {useNavigation} from "@react-navigation/native";
import {useLayoutEffect} from "react";
import {Feather} from "@expo/vector-icons";

export const NotificationsScreen = () => {
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Notifications",
            headerLeft: (() => (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginHorizontal: 20,
                    }}
                >
                    <View>
                        <Feather
                            name="arrow-left"
                            size={24}
                            color="black"
                        />
                    </View>
                </TouchableOpacity>
            )),
        });
    }, [])

    return (
        <View style={styles.container}>
            <Text>Notification Screen</Text>
        </View>
    )
}

