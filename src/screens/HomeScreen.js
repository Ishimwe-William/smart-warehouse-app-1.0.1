import {ScrollView, View} from "react-native";
import {useNavigation} from '@react-navigation/native';
import {MyButton} from "../components/MyButton";
import {useLayoutEffect} from "react";
import {styles as baseStyles} from "../utils/styles";

export default function HomeScreen() {
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Home",
        });
    }, []);

    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View style={[baseStyles.container, {alignItems: "center"}]}>
                <MyButton selected={true} HandleOnPress={() => navigation.navigate('Settings')}
                          ButtonText={"Go To Settings"}/>
                <MyButton selected={true} HandleOnPress={() => navigation.navigate('Requests')}
                          ButtonText={"Go To Requests"}/>
            </View>
        </ScrollView>
    );
}
