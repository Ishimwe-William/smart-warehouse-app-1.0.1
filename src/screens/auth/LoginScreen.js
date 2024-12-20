import React, {useEffect, useRef, useState} from 'react';
import {Animated, Dimensions, Image, StatusBar, StyleSheet, Text, TextInput, View,} from 'react-native';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {doc, getDoc} from 'firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import BigButton from '../../components/BigButton';
import {styles as baseStyles} from '../../utils/styles';
import {auth, db} from '../../config/firebaseConfig';
import {SafeAreaView} from 'react-native-safe-area-context';
import {LinkButton} from '../../components/LinkButton';
import Toast from 'react-native-toast-message';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

    const navigation = useNavigation();

    useEffect(() => {
        const updateLayout = () => setScreenDimensions(Dimensions.get('window'));
        const dimensionListener = Dimensions.addEventListener('change', updateLayout);

        return () => dimensionListener?.remove();
    }, []);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.trim().toLowerCase(),
                password.trim()
            );
            const user = userCredential.user;
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const role = userDoc.data()?.role || 'User';

            Toast.show({
                type: 'success',
                text1: 'Login Successful',
                text2: `Welcome back, ${role}!`,
            });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                Toast.show({
                    type: 'error',
                    text1: 'User Not Found',
                    text2: 'Please sign up or check your email.',
                });
            } else if (error.code === 'auth/wrong-password') {
                Toast.show({
                    type: 'error',
                    text1: 'Incorrect Password',
                    text2: 'Please try again.',
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Login Failed',
                    text2: 'Please check your credentials.',
                });
            }
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const backgroundTransform = scrollY.interpolate({
        inputRange: [0, screenDimensions.height * 0.4],
        outputRange: [0, -screenDimensions.height * 0.2],
        extrapolate: 'clamp',
    });

    const backgroundScale = scrollY.interpolate({
        inputRange: [0, screenDimensions.height * 0.4],
        outputRange: [1, 1.2],
        extrapolate: 'clamp',
    });

    const statusBarHeight = StatusBar.currentHeight || 0;

    return (
        <SafeAreaView style={[styles.container, { height: screenDimensions.height }]}>
            <Animated.View
                style={[
                    styles.backgroundImageContainer,
                    {
                        height: screenDimensions.height * 0.4 + statusBarHeight,
                        paddingTop: statusBarHeight,
                        transform: [
                            { translateY: backgroundTransform },
                            { scale: backgroundScale },
                        ],
                    },
                ]}
            >
                <Image
                    source={require('../../../assets/warehouse.jpg')}
                    style={[
                        styles.backgroundImage,
                        {
                            width: screenDimensions.width,
                            height: '100%',
                        },
                    ]}
                    resizeMode="cover"
                />
            </Animated.View>

            <Animated.ScrollView
                key={`${screenDimensions.width}-${screenDimensions.height}`}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                contentContainerStyle={[
                    styles.scrollContent,
                    { minHeight: screenDimensions.height },
                ]}
            >
                <View style={[styles.spacer, { height: screenDimensions.height * 0.35 }]} />

                <View style={styles.formContainer}>
                    <Text style={baseStyles.title}>Login</Text>
                    <TextInput
                        style={baseStyles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        numberOfLines={1}
                    />
                    <TextInput
                        style={baseStyles.input}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        onSubmitEditing={handleLogin}
                        numberOfLines={1}
                    />
                    <BigButton
                        title="Login"
                        handleSubmit={handleLogin}
                        isLoading={isLoading}
                    />
                    <LinkButton
                        size={14}
                        weight="400"
                        color="#5A9AA9"
                        title="Don't have an account? Sign Up"
                        onClick={() => navigation.navigate('Signup')}
                    />
                </View>
            </Animated.ScrollView>

            <Toast />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    backgroundImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    backgroundImage: {
        opacity: 0.9,
    },
    scrollContent: {
        flexGrow: 1,
    },
    formContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Dimensions.get("window").width > 400 ? 30 : 20,
        marginTop: -20,
        zIndex: 10,
    },
});
