import {createStackNavigator} from '@react-navigation/stack';
import {DashboardScreen} from '../../screens/dashboard/DashboardScreen';
import {DetailsTableScreen} from '../../screens/dashboard/DetailsTableScreen';
import {DetailsGraphScreen} from '../../screens/dashboard/DetailsGraphScreen';
import {headerOptions} from "../../utils/headerOptions";

const Stack = createStackNavigator();

export default function DashboardStack() {
    return (
        <Stack.Navigator
            screenOptions={({ route, navigation }) => headerOptions({ route, navigation })}
        >
            <Stack.Screen name="DevicesScreen" component={DashboardScreen}/>
            <Stack.Screen name="DetailsTableScreen" component={DetailsTableScreen}/>
            <Stack.Screen name="DetailsGraphScreen" component={DetailsGraphScreen}/>
        </Stack.Navigator>
    );
}