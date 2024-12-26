import {ScrollView, View} from "react-native";
import {useNavigation} from '@react-navigation/native';
import {MyButton} from "../components/MyButton";
import {useLayoutEffect} from "react";
import {styles as baseStyles} from "../utils/styles";
import {useAuth} from "../context/AuthContext";

export default function HomeScreen() {
    const navigation = useNavigation();
    const {userRole} = useAuth();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Home",
        });
    }, []);

    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View style={[baseStyles.container, {alignItems: "center"}]}>
                {userRole !== "Agronomist" && (
                    <MyButton selected={true} HandleOnPress={() => navigation.navigate('Settings')}
                              ButtonText={"Warehouse System Control"}/>
                )}
                <MyButton selected={true} HandleOnPress={() => navigation.navigate('Requests')}
                          ButtonText={"View Requests"}/>
            </View>
        </ScrollView>
    );
}
