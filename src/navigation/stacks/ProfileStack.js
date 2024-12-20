import { createStackNavigator } from '@react-navigation/stack';
import { UsersScreen } from '../../screens/UsersScreen';
import { ProfileScreen } from '../../screens/ProfileScreen';
import {defaultHeaderOptions} from "../../utils/headerOptions";

const Stack = createStackNavigator();

export default function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={defaultHeaderOptions}>
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Users" component={UsersScreen} />
        </Stack.Navigator>
    );
}
