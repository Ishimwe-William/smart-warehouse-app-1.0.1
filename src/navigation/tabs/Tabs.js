import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import HomeStack from '../stacks/HomeStack';
import DashboardStack from '../stacks/DashboardStack';
import ProfileStack from '../stacks/ProfileStack';
import {primaryColor} from "../../utils/colors";

const Tab = createMaterialTopTabNavigator();

export const NavTabs = () => {

    return (
        <Tab.Navigator
            tabBarPosition="bottom"
            screenOptions={{
                tabBarIndicatorStyle: {backgroundColor: primaryColor},
            }}
        >
            <Tab.Screen name="HomeStack" component={HomeStack} options={{
                tabBarLabel: "Home",
            }}/>
            <Tab.Screen name="DashboardStack" component={DashboardStack} options={{
                tabBarLabel: "Dashboard",
            }}/>
            <Tab.Screen name="ProfileStack" component={ProfileStack} options={{
                tabBarLabel: "Profile"
            }}/>
        </Tab.Navigator>
    );
}
