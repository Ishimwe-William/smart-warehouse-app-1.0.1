import { createStackNavigator } from '@react-navigation/stack';
import { UsersScreen } from '../../screens/UsersScreen';
import { ProfileScreen } from '../../screens/ProfileScreen';
import {headerOptions} from "../../utils/headerOptions";

const Stack = createStackNavigator();

export default function ProfileStack() {
    return (
        <Stack.Navigator
            screenOptions={({ route, navigation }) => headerOptions({ route, navigation })}
        >
            <Stack.Screen name="ProfileScreen" component={ProfileScreen}/>
            <Stack.Screen name="UsersScreen" component={UsersScreen}/>
        </Stack.Navigator>
    );
}