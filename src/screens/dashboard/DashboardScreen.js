import {useEffect, useLayoutEffect, useState} from "react";
import {Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from "react-native-safe-area-context";
import {styles as baseStyles} from "../../utils/styles";
import {MyButton} from "../../components/MyButton";
import {highColor, lowColor, middleColor} from "../../utils/colors";
import {DataStatus} from "../../components/DataStatus";
import {
    fetchMostRecentData,
    fetchThresholds,
    saveNotificationToFirebase,
    updateThresholds
} from "../../utils/rtdbUtils";
import IndicatorGrid from "../../components/IndicatorGrid";
import {useAuth} from "../../context/AuthContext";

const {width, height} = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

export const DashboardScreen = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newHumLowThreshold, setNewHumLowThreshold] = useState("");
    const [newHumHighThreshold, setNewHumHighThreshold] = useState("");
    const [newTempLowThreshold, setNewTempLowThreshold] = useState("");
    const [newTempHighThreshold, setNewTempHighThreshold] = useState("");
    const navigation = useNavigation();
    const [tempRangeColor, setTempRangeColor] = useState(middleColor);
    const [humRangeColor, setHumRangeColor] = useState(middleColor);
    const {userRole, user} = useAuth();

    const [data, setData] = useState({
        temp: 0,
        hum: 0,
        created_time: "",
        created_date: "",
    });

    const [thresholds, setThresholds] = useState({
        humLowThreshold: 40,
        humHighThreshold: 60,
        tempLowThreshold: 15,
        tempHighThreshold: 25,
    });

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Dashboard",
        });
    }, []);

    // Initial thresholds fetch
    useEffect(() => {
        fetchThresholds().then((data) => {
            if (data) {
                setThresholds({
                    tempLow: data.tempLowThreshold,
                    tempHigh: data.tempHighThreshold,
                    humLow: data.humLowThreshold,
                    humHigh: data.humHighThreshold,
                });
            }
        });
    }, []);

    const fetchData = async () => {
        const recentData = await fetchMostRecentData('/warehouse/data/');
        if (recentData) {
            setData({
                temp: recentData.temperature,
                hum: recentData.humidity,
                created_time: recentData.createdAt_time,
                created_date: recentData.createdAt_date,
            });
        }
    };

    const fetchThresholdsFromFirebase = async () => {
        const fetchedThresholds = await fetchThresholds();
        if (fetchedThresholds) {
            setThresholds((prev) => {
                if (
                    prev.humLowThreshold !== fetchedThresholds.humLowThreshold ||
                    prev.humHighThreshold !== fetchedThresholds.humHighThreshold ||
                    prev.tempLowThreshold !== fetchedThresholds.tempLowThreshold ||
                    prev.tempHighThreshold !== fetchedThresholds.tempHighThreshold
                ) {
                    return fetchedThresholds;
                }
                return prev;
            });
        }
    };

    // Periodic data and thresholds fetch
    useEffect(() => {
        fetchData();
        fetchThresholdsFromFirebase();
        const intervalId = setInterval(() => {
            fetchData();
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // Threshold monitoring and notification handling
    useEffect(() => {
        const checkAndSaveNotification = async (type, value, thresholdConfig) => {
            const numericValue = parseFloat(value);
            if (isNaN(numericValue)) {
                console.error(`Invalid value for ${type}: ${value}`);
                return;
            }

            // Prevent notification for zero values
            if (data.hum === 0 && data.temp === 0) return;

            const isOutOfRange = numericValue < thresholdConfig.low || numericValue > thresholdConfig.high;

            if (isOutOfRange) {
                const notification = {
                    type: `${type} Threshold Alert`,
                    message: `${type} is ${
                        numericValue < thresholdConfig.low ? "below" : "above"
                    } the threshold (${numericValue}${type === 'Temperature' ? '°C' : '%'})`,
                    value: numericValue,
                    timestamp: new Date().toISOString(),
                    thresholdChanged: true,
                    alertType: numericValue < thresholdConfig.low ? 'low' : 'high',
                    measurementType: type.toLowerCase()
                };

                // Update UI color
                if (type === 'Temperature') {
                    setTempRangeColor(numericValue < thresholdConfig.low ? lowColor : highColor);
                } else {
                    setHumRangeColor(numericValue < thresholdConfig.low ? lowColor : highColor);
                }

                try {
                    // Save as a general notification
                    // await saveNotificationToFirebase(notification);
                } catch (error) {
                    console.error(`Error saving ${type} notification:`, error);
                }
            } else {
                // Reset color when back in range
                if (type === "Temperature") {
                    setTempRangeColor(middleColor);
                } else {
                    setHumRangeColor(middleColor);
                }
            }
        };

        if (data && thresholds) {
            checkAndSaveNotification('Temperature', data.temp, {
                low: thresholds.tempLowThreshold,
                high: thresholds.tempHighThreshold
            });
            checkAndSaveNotification('Humidity', data.hum, {
                low: thresholds.humLowThreshold,
                high: thresholds.humHighThreshold
            });
        }
    }, [data, thresholds, user]);

    const saveThresholds = async () => {
        if (
            isNaN(newHumLowThreshold) || isNaN(newHumHighThreshold) ||
            isNaN(newTempLowThreshold) || isNaN(newTempHighThreshold)
        ) {
            Alert.alert("Error", "Threshold values must be numeric.");
            return;
        }

        if (
            parseFloat(newHumHighThreshold) < parseFloat(newHumLowThreshold) ||
            parseFloat(newTempHighThreshold) < parseFloat(newTempLowThreshold)
        ) {
            Alert.alert("Invalid data", "High value cannot be lower than Low value");
            return;
        }

        const updatedThresholds = {
            humLowThreshold: parseFloat(newHumLowThreshold) || thresholds.humLowThreshold,
            humHighThreshold: parseFloat(newHumHighThreshold) || thresholds.humHighThreshold,
            tempLowThreshold: parseFloat(newTempLowThreshold) || thresholds.tempLowThreshold,
            tempHighThreshold: parseFloat(newTempHighThreshold) || thresholds.tempHighThreshold,
        };

        await updateThresholds(updatedThresholds);
        setThresholds(updatedThresholds);
        setIsModalVisible(false);

        // Create threshold update notification
        const thresholdNotification = {
            type: 'Threshold Update',
            message: 'Temperature and Humidity thresholds have been updated',
            timestamp: new Date().toISOString(),
            changes: {
                temperature: {
                    low: updatedThresholds.tempLowThreshold,
                    high: updatedThresholds.tempHighThreshold
                },
                humidity: {
                    low: updatedThresholds.humLowThreshold,
                    high: updatedThresholds.humHighThreshold
                }
            }
        };

        // Save as general notification since threshold changes affect all users
        await saveNotificationToFirebase(thresholdNotification);
    };

    const handleSaveThresholds = () => {
        saveThresholds();
    };
    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <SafeAreaView>
                    <View style={styles.contentContainer}>
                        <Text style={baseStyles.title}>Recent Data</Text>
                        <Text
                            style={[baseStyles.dateText, {textAlign: "center"}]}>{data.created_date} {data.created_time}</Text>
                        <View style={baseStyles.row}>
                            <Text style={baseStyles.subtitle}>Indicators:</Text>
                            <IndicatorGrid highColor={highColor} middleColor={middleColor} lowColor={lowColor}/>
                        </View>
                        <DataStatus data={data.temp} dataName={"Temperature"} statusColor={tempRangeColor}/>
                        <DataStatus data={data.hum} dataName={"Humidity"} statusColor={humRangeColor}/>
                    </View>
                    <MyButton HandleOnPress={() => navigation.navigate('DetailsGraph')}
                              ButtonText={"View Data Graph"}/>
                </SafeAreaView>
            </ScrollView>
            <Modal
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Update Thresholds</Text>
                        <View style={styles.modalInputContainer}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalInputWrapper}>
                                    <Text style={styles.modalLabel}>Humidity Low Threshold:</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={newHumLowThreshold}
                                        onChangeText={setNewHumLowThreshold}
                                        keyboardType="numeric"
                                        onSubmitEditing={handleSaveThresholds}
                                    />
                                </View>

                                <View style={styles.modalInputWrapper}>
                                    <Text style={styles.modalLabel}>Humidity High Threshold:</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={newHumHighThreshold}
                                        onChangeText={setNewHumHighThreshold}
                                        keyboardType="numeric"
                                        onSubmitEditing={handleSaveThresholds}
                                    />
                                </View>

                                <View style={styles.modalInputWrapper}>
                                    <Text style={styles.modalLabel}>Temperature Low Threshold:</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={newTempLowThreshold}
                                        onChangeText={setNewTempLowThreshold}
                                        keyboardType="numeric"
                                        onSubmitEditing={handleSaveThresholds}
                                    />
                                </View>

                                <View style={styles.modalInputWrapper}>
                                    <Text style={styles.modalLabel}>Temperature High Threshold:</Text>
                                    <TextInput
                                        style={styles.modalInput}
                                        value={newTempHighThreshold}
                                        onChangeText={setNewTempHighThreshold}
                                        keyboardType="numeric"
                                        onSubmitEditing={handleSaveThresholds}
                                    />
                                </View>

                            </View>

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={handleSaveThresholds}>
                                    <Text style={styles.modalButtonText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Modal>
            {userRole === "Admin" && (
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                        setNewHumLowThreshold(thresholds.humLowThreshold.toString());
                        setNewHumHighThreshold(thresholds.humHighThreshold.toString());
                        setNewTempLowThreshold(thresholds.tempLowThreshold.toString());
                        setNewTempHighThreshold(thresholds.tempHighThreshold.toString());
                        setIsModalVisible(true);
                    }}
                >
                    <Text style={styles.editButtonText}>Edit Thresholds</Text>
                </TouchableOpacity>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        marginHorizontal: 20,
    },
    colorItem: {
        alignItems: 'center',
        marginHorizontal: 12,
    },
    colorContainer: {
        alignItems: 'center',
        marginVertical: 8,
        justifyContent: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
    },
    modalInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: isTablet ? '70%' : '85%',
        padding: isTablet ? 30 : 20,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 12,
        maxWidth: isTablet ? 500 : 350, // Adjust width for tablets
    },
    modalTitle: {
        fontSize: isTablet ? 22 : 20, // Larger title font for tablets
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15, // Spacing below the title
        textAlign: "center",
    },
    modalContent: {
        marginVertical: 10,
    },
    modalInputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 12, // Slightly increased spacing between inputs
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555',
        flex: 1, // Ensures consistent spacing
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 10,
        width: 120,
        backgroundColor: '#f9f9f9',
    },
    modalButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around", // Equal spacing between buttons
        marginTop: 20,
    },
    modalButton: {
        backgroundColor: "#3498db",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 6,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    editButton: {
        position: "absolute",
        bottom: isTablet ? 18 : 10,
        right: isTablet ? 18 : 10,
        backgroundColor: "#fff",
        paddingVertical: isTablet ? 18 : 10,
        paddingHorizontal: isTablet ? 18 : 10,
        borderRadius: 8,
        elevation: 4,
    },
    editButtonText: {
        color: "#e74c3c",
        fontWeight: "bold",
        fontSize: isTablet ? 18 : 14,
    },
});
