import React, { useEffect, useState, useRef } from 'react';
import {
    Text,
    TextInput,
    View,
    Dimensions,
    Animated,
    Image,
    StyleSheet,
    Platform,
    StatusBar
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { setDoc, doc } from "firebase/firestore";
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message'; // Import Toast library
import BigButton from '../../components/BigButton';
import { auth, db } from '../../config/firebaseConfig';
import { styles as baseStyles } from '../../utils/styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinkButton } from '../../components/LinkButton';

export const RegisterScreen = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const scrollY = useRef(new Animated.Value(0)).current;
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const updateLayout = () => {
            setScreenDimensions(Dimensions.get('window'));
        };

        Dimensions.addEventListener('change', updateLayout);

        return () => {
            if (Platform.OS === 'web') {
                Dimensions.removeEventListener('change', updateLayout);
            }
        };
    }, []);

    const handleSignup = async () => {
        try {
            setIsLoading(true);
            const createdUser = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
            await setDoc(doc(db, "users", createdUser.user.uid), {
                role: 'User',
                email: email.trim().toLowerCase()
            });
            await sendEmailVerification(createdUser.user);

            // Show success toast
            Toast.show({
                type: 'success',
                text1: 'Account created successfully!',
                text2: 'Please verify your email address.',
            });
            navigation.navigate('Login'); // Navigate to Login after success
        } catch (error) {
            // Show error toast
            Toast.show({
                type: 'error',
                text1: 'Signup failed',
                text2: error.message || 'Please try again.',
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const backgroundTransform = scrollY.interpolate({
        inputRange: [0, screenDimensions.height * 0.4],
        outputRange: [0, -screenDimensions.height * 0.2],
        extrapolate: 'clamp'
    });

    const backgroundScale = scrollY.interpolate({
        inputRange: [0, screenDimensions.height * 0.4],
        outputRange: [1, 1.2],
        extrapolate: 'clamp'
    });

    const statusBarHeight = StatusBar.currentHeight || 0; // Get the status bar height

    return (
        <SafeAreaView style={styles.container}>
            <Animated.View
                style={[styles.backgroundImageContainer, {
                    height: screenDimensions.height * 0.4 + statusBarHeight, // Add status bar height
                    paddingTop: statusBarHeight, // Push the image below the status bar
                    transform: [
                        { translateY: backgroundTransform },
                        { scale: backgroundScale }
                    ]
                }]}>
                <Image
                    source={require('../../../assets/warehouse.jpg')}
                    style={[styles.backgroundImage, {
                        width: screenDimensions.width,
                        height: '100%'
                    }]}
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
                    { minHeight: screenDimensions.height }
                ]}>
                <View style={[styles.spacer, { height: screenDimensions.height * 0.35 }]} />

                <View style={styles.formContainer}>
                    <Text style={baseStyles.title}>Sign Up</Text>
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
                        onSubmitEditing={handleSignup}
                        numberOfLines={1}
                    />
                    <BigButton title={"Sign Up"} handleSubmit={handleSignup} isLoading={isLoading} />
                    <LinkButton
                        size={14}
                        weight={'400'}
                        color='#5A9AA9'
                        title={"Already have an account? Log In"}
                        onClick={() => navigation.navigate('Login')}
                    />
                </View>
            </Animated.ScrollView>

            {/* Add Toast Container */}
            <Toast />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    backgroundImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1
    },
    backgroundImage: {
        opacity: 0.9
    },
    scrollContent: {
        flexGrow: 1
    },
    formContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        marginTop: -20,
        zIndex: 10
    }
});
