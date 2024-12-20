import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {styles as baseStyles} from "../utils/styles";
import {useAuth} from "../context/AuthContext";
import {SafeAreaView} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native"
import {useLayoutEffect} from "react";

export const ProfileScreen = () => {
    const {logout, user, userRole} = useAuth();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "My Account",
        });
    }, []);

    const handleLogout = () => {
        logout();
    }

    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <SafeAreaView>
                <View style={[baseStyles.container, {marginTop: -40}]}>
                    <View style={baseStyles.row}>
                        <Text style={baseStyles.text}>Email: </Text>
                        <Text style={baseStyles.subtitle}>{user?.email}</Text>
                    </View>
                    <View style={baseStyles.row}>
                        <Text style={baseStyles.text}>Role: </Text>
                        <Text style={baseStyles.subtitle}>{userRole}</Text>
                    </View>
                </View>

                <TouchableOpacity style={[baseStyles.row, baseStyles.textContainer, {borderBottomWidth: 1}]}
                                  onPress={handleLogout}>
                    <Ionicons name={'log-out-outline'} size={32} color={'#000'} style={{marginHorizontal: 20,}}/>
                    <Text style={baseStyles.subtitle}>Sign out</Text>
                </TouchableOpacity>
                {userRole === 'Admin' && (
                    <TouchableOpacity style={[baseStyles.row, baseStyles.textContainer, {borderBottomWidth: 1}]}
                                      onPress={() => {
                                          (navigation.navigate('UsersScreen'))
                                      }}>
                        <Ionicons name={'people-outline'} size={32} color={'#000'} style={{marginHorizontal: 20,}}/>
                        <Text style={baseStyles.subtitle}>Manage Users</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        </ScrollView>
    )
}