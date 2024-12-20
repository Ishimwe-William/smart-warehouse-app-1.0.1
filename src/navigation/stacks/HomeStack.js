import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../../screens/HomeScreen";
import SettingsScreen from "../../screens/SettingScreen";
import RequestsScreen from "../../screens/requests/RequestsScreen";
import { headerOptions } from "../../utils/headerOptions";

const Stack = createStackNavigator();

export default function HomeStack() {
    return (
        <Stack.Navigator
            screenOptions={({ route, navigation }) => headerOptions({ route, navigation })}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Requests" component={RequestsScreen} />
        </Stack.Navigator>
    );
}
