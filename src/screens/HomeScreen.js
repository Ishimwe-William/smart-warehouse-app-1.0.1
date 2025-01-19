import {Animated, Dimensions, Image, ScrollView, StatusBar, StyleSheet, Text, View} from "react-native";
import {useNavigation} from '@react-navigation/native';
import {MyButton} from "../components/MyButton";
import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import {styles as baseStyles} from "../utils/styles";
import {useAuth} from "../context/AuthContext";

export default function HomeScreen() {
    const navigation = useNavigation();
    const {user, userRole} = useAuth();
    const scrollY = useRef(new Animated.Value(0)).current;
    const [screenDimensions, setScreenDimensions] = useState(Dimensions.get('window'));

    useEffect(() => {
        const updateLayout = () => setScreenDimensions(Dimensions.get('window'));
        const dimensionListener = Dimensions.addEventListener('change', updateLayout);

        return () => dimensionListener?.remove();
    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Home",
            headerLeft: undefined,
        });
    }, []);

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
        <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View style={styles.welcomeContainer}>
                <Text style={baseStyles.subtitle}>Welcome {user.email}</Text>
            </View>
            <Animated.View
                style={[
                    styles.backgroundImageContainer,
                    {
                        height: screenDimensions.height * 0.4 + statusBarHeight,
                        paddingTop: statusBarHeight,
                        transform: [
                            {translateY: backgroundTransform},
                            {scale: backgroundScale},
                        ],
                    },
                ]}
            >
                <Image
                    source={require('../../assets/warehouse.jpg')}
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
            <View style={[baseStyles.container, styles.buttonsContainer]}>
                {userRole !== "Agronomist" && (
                    <View style={baseStyles.row}>
                        <MyButton
                            selected={true}
                            HandleOnPress={() => navigation.navigate('Settings')}
                            ButtonText={"Warehouse System Control"}
                        />
                        <View style={{paddingHorizontal: 20}}/>
                        <MyButton
                            selected={true}
                            HandleOnPress={() => navigation.navigate('DashboardStack')}
                            ButtonText={"Dashboard"}
                        />
                    </View>
                )}
                <View style={baseStyles.row}>
                    <MyButton
                        selected={true}
                        HandleOnPress={() => navigation.navigate('Requests')}
                        ButtonText={"View Requests"}
                    />
                    <View style={{paddingHorizontal: 20}}/>
                    <MyButton
                        selected={true}
                        HandleOnPress={() => navigation.navigate('ProfileStack')}
                        ButtonText={"View Profile"}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    welcomeContainer: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    backgroundImageContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    backgroundImage: {
        opacity: 0.9,
    },
    buttonsContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
});
