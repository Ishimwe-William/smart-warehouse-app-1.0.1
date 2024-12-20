import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {Text} from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavTabs } from './tabs/Tabs';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './stacks/AuthStack';
import { EmailVerificationScreen } from '../screens/auth/EmailVerificationScreen';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import {defaultHeaderOptions} from "../utils/headerOptions";

const Stack = createStackNavigator();

export const MainNavigation = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
                <Text>Make sure you are connected to the internet.</Text>
            </SafeAreaView>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    user.emailVerified ? (
                        <>
                            <Stack.Screen name="MyTabs" component={NavTabs} />
                            <Stack.Screen
                                name="NotificationsScreen"
                                component={NotificationsScreen}
                                options={{headerShown:true}}
                            />
                        </>
                    ) : (
                        <Stack.Screen
                            name="EmailVerification"
                            component={EmailVerificationScreen}
                            options={{ headerShown: true, title: 'Verify Email' }}
                        />
                    )
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};