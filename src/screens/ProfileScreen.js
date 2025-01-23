import {ScrollView, Text, TextInput, TouchableOpacity, View} from "react-native";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";
import {styles as baseStyles} from "../utils/styles";
import {useAuth} from "../context/AuthContext";
import {SafeAreaView} from "react-native-safe-area-context";
import {useNavigation} from "@react-navigation/native";
import {useLayoutEffect, useState} from "react";
import {updateProfile} from "firebase/auth";

export const ProfileScreen = () => {
    const [displayName, setDisplayName] = useState(user?.displayName || "");
    const [isEditing, setIsEditing] = useState(false); // Track if in edit mode
    const {logout, user, userRole} = useAuth();
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "My Account",
        });
    }, []);

    const handleLogout = () => {
        logout();
    };

    const handleUpdateName = async () => {
        if (user && displayName.trim()) {
            try {
                // Update the user's display name in Firebase Authentication
                await updateProfile(user, {displayName: displayName.trim()});

                // Optionally update the local state if necessary
                console.log("Name updated successfully!");
                setIsEditing(false); // Exit edit mode after saving
            } catch (e) {
                console.error("Error updating name:", e);
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <SafeAreaView>
                <View style={[baseStyles.container, {marginTop: -40}]}>
                    {/* Display name row with edit functionality */}
                    <View style={[baseStyles.row, {alignItems: "center"}]}>
                        <Text style={baseStyles.text}>Name: </Text>
                        {isEditing ? (
                            <>
                                <TextInput
                                    style={[
                                        baseStyles.textInput,
                                        // {flex: 1, borderBottomWidth: 1, borderBottomColor: "#ccc", padding: 5},
                                    ]}
                                    value={displayName}
                                    onChangeText={setDisplayName}
                                    placeholder="Enter new name"
                                />
                                <TouchableOpacity onPress={handleUpdateName} style={{marginLeft: 10}}>
                                    <Ionicons name="checkmark-outline" size={24} color="green"/>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setIsEditing(false)} style={{marginLeft: 10}}>
                                    <Ionicons name="close-outline" size={24} color="red"/>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <Text style={baseStyles.subtitle}>{user?.displayName || "-- No Name --"}</Text>
                                <TouchableOpacity onPress={() => {
                                    setIsEditing(true);
                                    setDisplayName(user?.displayName || ""); // Pre-fill current name
                                }} style={{marginLeft: 10}}>
                                    <MaterialCommunityIcons name="pencil-outline" size={24} color="#000"/>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    <View style={baseStyles.row}>
                        <Text style={baseStyles.text}>Email: </Text>
                        <Text style={baseStyles.subtitle}>{user?.email}</Text>
                    </View>
                    <View style={baseStyles.row}>
                        <Text style={baseStyles.text}>Role: </Text>
                        <Text style={baseStyles.subtitle}>{userRole}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[baseStyles.row, baseStyles.textContainer, {borderBottomWidth: 1}]}
                    onPress={handleLogout}
                >
                    <Ionicons name={"log-out-outline"} size={32} color={"#000"} style={{marginHorizontal: 20}}/>
                    <Text style={baseStyles.subtitle}>Sign out</Text>
                </TouchableOpacity>
                {userRole === "Admin" && (
                    <TouchableOpacity
                        style={[baseStyles.row, baseStyles.textContainer, {borderBottomWidth: 1}]}
                        onPress={() => navigation.navigate("Users")}
                    >
                        <Ionicons name={"people-outline"} size={32} color={"#000"} style={{marginHorizontal: 20}}/>
                        <Text style={baseStyles.subtitle}>Manage Users</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        </ScrollView>
    );
};
