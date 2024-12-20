import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, FlatList, TouchableOpacity, Modal, View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { styles as baseStyles } from "../utils/styles";
import { fetchUsers } from '../utils/firestoreUtil';
import { getAuth } from 'firebase/auth';
import { MyButton } from '../components/MyButton';
import { db } from '../config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import MessagePopup from '../components/MessagePopup';
import {useLayoutEffect} from "react";
import {useNavigation} from "@react-navigation/native";

const MyRoles = ['User', 'Admin', 'Manager', 'Farmer', "Agronomist"];

export const UsersScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [roles] = useState(MyRoles);
    const [successMessage, setSuccessMessage] = useState('');
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Users",
        });
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const usersList = await fetchUsers();
                const currentUser = getAuth().currentUser;
                const filteredUsers = usersList.filter(user => user.id !== currentUser?.uid);
                setUsers(filteredUsers);
            } catch (error) {
                console.error("Error fetching users:", error);
                setSuccessMessage('Failed to load users');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleRoleChange = async () => {
        if (selectedUser && selectedRole) {
            try {
                const userRef = doc(db, "users", selectedUser.id);
                await updateDoc(userRef, { role: selectedRole });

                // Update local state
                const updatedUsers = users.map(user =>
                    user.id === selectedUser.id
                        ? { ...user, role: selectedRole }
                        : user
                );
                setUsers(updatedUsers);

                // Set success message and close modal
                setSuccessMessage(`Role updated to ${selectedRole}`);
                setShowModal(false);
                setSelectedUser(null);
                setSelectedRole('');
            } catch (error) {
                console.error("Error updating role:", error);
                setSuccessMessage("Failed to update role");
            }
        }
    };

    useEffect(() => {
        let timer;
        if (successMessage) {
            timer = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        }
        return () => clearTimeout(timer);
    }, [successMessage]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading users...</Text>
                <ActivityIndicator size={'large'} />
            </View>
        );
    }

    if (!users || users.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.text}>Users will be shown here!</Text>
            </View>
        );
    }

    return (
        <SafeAreaView>
            <FlatList
                data={users}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[baseStyles.textContainer, baseStyles.row, { justifyContent: 'space-around', aligns: 'center' }]}>
                        <Text style={[baseStyles.subtitle, { marginLeft: -20 }]}>{item.email}</Text>
                        <Text style={[baseStyles.text, { fontSize: 16, fontWeight: 'bold', color: "#5A9AA9" }]}>{item.role}</Text>
                        <MyButton HandleOnPress={() => { setSelectedUser(item); setShowModal(true); }} ButtonText={"Edit"} />
                    </View>
                )}
            />

            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Change Role</Text>
                            <Text style={styles.modalSubtitle}>
                                Select a new role for {selectedUser?.email}
                            </Text>

                            <View style={styles.roleListContainer}>
                                {roles.map((role, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.roleOption,
                                            selectedRole === role && styles.selectedRoleOption
                                        ]}
                                        onPress={() => setSelectedRole(role)}
                                    >
                                        <Text style={[
                                            styles.roleText,
                                            selectedRole === role && styles.selectedRoleText
                                        ]}>
                                            {role}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        styles.updateButton,
                                        !selectedRole && styles.disabledButton
                                    ]}
                                    onPress={handleRoleChange}
                                    disabled={!selectedRole}
                                >
                                    <Text style={styles.updateButtonText}>Update Role</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Modal>
            <MessagePopup
                text={successMessage}
                moreStyle={{ top: -20 }}
                type={'success'}
                visible={!!successMessage}
                onDismiss={() => setSuccessMessage('')}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '85%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    roleListContainer: {
        marginBottom: 20,
    },
    roleOption: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedRoleOption: {
        backgroundColor: '#5A9AA9',
    },
    roleText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    selectedRoleText: {
        color: 'white',
        fontWeight: 'bold',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f4f4f4',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    updateButton: {
        backgroundColor: '#5A9AA9',
    },
    updateButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
