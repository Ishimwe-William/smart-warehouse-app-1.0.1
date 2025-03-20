import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { Alert } from 'react-native';

const AuthContext = createContext();

const DEFAULT_ROLE = 'User';

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: null,
        loading: true,
        userRole: DEFAULT_ROLE,
        authError: null,
    });

    const { user, loading, userRole, authError } = authState;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {
                setAuthState((prev) => ({ ...prev, loading: true, authError: null }));
                if (user) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", user.uid));
                        const role = userDoc.exists() ? userDoc.data()?.role : DEFAULT_ROLE;
                        setAuthState({ user, userRole: role || DEFAULT_ROLE, loading: false, authError: null });
                    } catch (error) {
                        if (__DEV__) {
                            console.error("Error fetching user role:", error);
                        }
                        setAuthState((prev) => ({
                            ...prev,
                            authError: "Failed to fetch user role.",
                            loading: false,
                        }));
                    }
                } else {
                    setAuthState({ user: null, userRole: DEFAULT_ROLE, loading: false, authError: null });
                }
            },
            (error) => {
                if (__DEV__) {
                    console.error("onAuthStateChanged error:", error);
                }
                setAuthState({ user: null, userRole: DEFAULT_ROLE, loading: false, authError: error.message });
            }
        );

        return () => unsubscribe(); // Clean up the listener on unmount
    }, []);

    useEffect(() => {
        if (authError) {
            Toast.show({
                type: "error",
                text1: "Authentication Error",
                text2: authError,
            });
        }
    }, [authError]);

    const logout = async () => {
        Alert.alert(
            "Confirm Logout",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Logout cancelled"),
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: async () => {
                        try {
                            setAuthState((prev) => ({ ...prev, authError: null }));
                            await signOut(auth);
                            setAuthState({ user: null, userRole: DEFAULT_ROLE, loading: false, authError: null });
                        } catch (error) {
                            if (__DEV__) {
                                console.error("Logout failed:", error);
                            }
                            setAuthState((prev) => ({ ...prev, authError: "Failed to log out. Please try again." }));
                        }
                    },
                },
            ]
        );
    };

    return (
        <AuthContext.Provider value={{ user, loading, userRole, authError, logout }}>
            {children}
            <Toast />
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
