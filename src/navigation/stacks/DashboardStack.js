import {createStackNavigator} from '@react-navigation/stack';
import {DashboardScreen} from '../../screens/dashboard/DashboardScreen';
import {DetailsTableScreen} from '../../screens/dashboard/DetailsTableScreen';
import {DetailsGraphScreen} from '../../screens/dashboard/DetailsGraphScreen';
import {defaultHeaderOptions} from "../../utils/headerOptions";

const Stack = createStackNavigator();

export default function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={defaultHeaderOptions}>
            <Stack.Screen name="Dashboard" component={DashboardScreen}/>
            <Stack.Screen name="DetailsTable" component={DetailsTableScreen}/>
            <Stack.Screen name="DetailsGraph" component={DetailsGraphScreen}/>
        </Stack.Navigator>
    );
}