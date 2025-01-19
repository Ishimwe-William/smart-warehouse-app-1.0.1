import {
    ActivityIndicator,
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {LineChart} from "react-native-chart-kit";
import {MaterialIcons} from "@expo/vector-icons";
import {AnimatedCircularProgress} from "react-native-circular-progress";

import {useWarehouseData} from '../../hooks/useWarehouseData';
import {TimeframeSelector} from '../../components/TimeframeSelector';
import {LinkButton} from "../../components/LinkButton";
import {styles as baseStyles} from '../../utils/styles';
import {primaryColor} from "../../utils/colors";
import {useEffect, useLayoutEffect, useState} from "react";
import {useNavigation} from "@react-navigation/native";
import PointsControl from "../../components/PointsControl";

const {width, height} = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

export const DetailsGraphScreen = () => {
    const navigation = useNavigation();
    const DEFAULT_POINTS = isTablet ? 7 : 5;

    const [pointsToShow, setPointsToShow] = useState(DEFAULT_POINTS);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [visibleDataStart, setVisibleDataStart] = useState(0);
    const [showDots, setShowDots] = useState(true);
    const {
        data,
        timeframe,
        setTimeframe,
        isLoading,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate
    } = useWarehouseData();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Warehouse Data",
            headerLeft: undefined,
        });
    }, []);

    useEffect(() => {
        // Reset visible data start when points change to prevent out-of-bounds issues
        if (visibleDataStart + pointsToShow > data.length) {
            setVisibleDataStart(Math.max(0, data.length - pointsToShow));
        }
    }, [pointsToShow, data.length]);

    const chartConfig = {
        backgroundColor: "#e26a00",
        backgroundGradientFrom: "#fb8c00",
        backgroundGradientTo: "#ffa726",
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        propsForLabels: {
            fontSize: isTablet ? 14 : 10,
        },
        propsForVerticalLabels: {
            rotation: isTablet ? 0 : -45,
        },
        propsForDots: {
            r: isTablet ? "10" : "8",
            strokeWidth: "2",
            stroke: "#ffa726",
        },
        // Set fixed Y axis configuration
        segments: 5,
        formatYLabel: (value) => Math.round(value).toString(),
    };

    const getVisibleData = () => {
        const visibleData = data.slice(visibleDataStart, visibleDataStart + pointsToShow);

        return {
            labels: [
                "", // Label for 0 point
                ...visibleData.map((item) => {
                    const dateObj = new Date(item.createdAt);
                    const time = dateObj.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                    const date = dateObj.toLocaleDateString([], {day: '2-digit', month: 'short'});
                    return `${time}\n${date}`;
                }),
                "" // Label for 100 point
            ],
            datasets: [
                {
                    data: visibleData.map((item) => item.temperature),
                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                    strokeWidth: 5,
                    withDots: showDots,  // Show dots
                    hidePointsAtIndex: [0, visibleData.length + 1]  // Hide dots for first and last points (0 and 100)
                },
                {
                    data: visibleData.map((item) => item.humidity),
                    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                    strokeWidth: 5,
                    withDots: showDots,  // Show dots
                    hidePointsAtIndex: [0, visibleData.length + 1]  // Hide dots for first and last points (0 and 100)
                },
                {
                    data: [0],
                    withDots: false
                },
                {
                    data: [100],
                    withDots: false,
                },
            ],
            legend: ["Temperature (°C)", "Humidity (%)"]
        };
    };

    const handleScroll = (direction) => {
        if (direction === 'left' && visibleDataStart > 0) {
            setVisibleDataStart(prev => Math.max(0, prev - pointsToShow));
        } else if (direction === 'right' && visibleDataStart + pointsToShow < data.length) {
            setVisibleDataStart(prev => Math.min(data.length - pointsToShow, prev + pointsToShow));
        }
    };

    const handlePointsChange = (newPoints) => {
        setPointsToShow(newPoints);
    };
    return (
        <SafeAreaView style={{flex: 1}}>
            <ScrollView>
                <View style={styles.container}>
                    <TimeframeSelector
                        timeframe={timeframe}
                        setTimeframe={setTimeframe}
                        customStartDate={customStartDate}
                        setCustomStartDate={setCustomStartDate}
                        customEndDate={customEndDate}
                        setCustomEndDate={setCustomEndDate}
                    />

                    {isLoading ? (
                        <ActivityIndicator size="large"/>
                    ) : data.length === 0 ? (
                        <Text style={baseStyles.subtitle}>No data found in {`${timeframe} time`}</Text>
                    ) : (
                        <View style={styles.graphContainer}>
                            <TouchableOpacity
                                style={[styles.scrollButton, {left: 0}]}
                                onPress={() => handleScroll('left')}
                                disabled={visibleDataStart === 0}
                            >
                                <MaterialIcons
                                    name="chevron-left"
                                    size={24}
                                    color={visibleDataStart === 0 ? "#ccc" : primaryColor}
                                />
                            </TouchableOpacity>

                            <LineChart
                                data={getVisibleData()}
                                width={Dimensions.get("window").width - (isTablet ? 100 : 80)}
                                height={300}
                                chartConfig={chartConfig}
                                bezier
                                onDataPointClick={(dataPoint) => {
                                    const {index} = dataPoint;
                                    const point = data[visibleDataStart + index];
                                    setSelectedPoint(point);
                                    setIsModalVisible(true);
                                }}
                            />

                            <TouchableOpacity
                                style={[styles.scrollButton, {right: 0}]}
                                onPress={() => handleScroll('right')}
                                disabled={visibleDataStart + pointsToShow >= data.length}
                            >
                                <MaterialIcons
                                    name="chevron-right"
                                    size={24}
                                    color={visibleDataStart + pointsToShow >= data.length ? "#ccc" : primaryColor}
                                />
                            </TouchableOpacity>
                        </View>
                    )}

                    <PointsControl
                        initialPoints={pointsToShow}
                        onPointsChange={handlePointsChange}
                        minPoints={isTablet ? 5 : 3}
                        maxPoints={100}
                        setShowDots={setShowDots}
                        showDots={showDots}
                    />

                    <LinkButton
                        size={14}
                        weight={'400'}
                        color='#5A9AA9'
                        title="View Raw Data"
                        onClick={() => navigation.navigate('DetailsTable')}
                    />
                </View>
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <MaterialIcons name="details" size={24} color="white"/>
                            <Text style={styles.modalTitle}>Data Point Details</Text>
                        </View>

                        <View style={styles.modalContent}>
                            <View style={[baseStyles.row, {justifyContent: 'center'}]}>
                                <MaterialIcons name="access-time" size={16} color="gray"/>
                                <Text style={[baseStyles.text, {color: 'gray', fontSize: 14}]}>
                                    {` `}{new Date(selectedPoint?.createdAt).toLocaleString()}
                                </Text>
                            </View>

                            <View style={styles.gaugeContainer}>
                                <View style={styles.gaugeWrapper}>
                                    <AnimatedCircularProgress
                                        size={120}
                                        width={15}
                                        fill={(selectedPoint?.temperature || 0) / 100 * 100}
                                        tintColor="red"
                                        backgroundColor="#ddd"
                                        arcSweepAngle={240}
                                        rotation={240}
                                        lineCap="round"
                                    >
                                        {(fill) => (
                                            <View style={styles.gaugeTextContainer}>
                                                <MaterialIcons name="thermostat" size={24} color="red"/>
                                                <Text style={styles.gaugeText}>{selectedPoint?.temperature}°C</Text>
                                            </View>
                                        )}
                                    </AnimatedCircularProgress>
                                    <Text style={styles.gaugeLabelText}>Temperature</Text>
                                </View>

                                <View style={styles.gaugeWrapper}>
                                    <AnimatedCircularProgress
                                        size={120}
                                        width={15}
                                        fill={selectedPoint?.humidity || 0}
                                        tintColor="blue"
                                        backgroundColor="#ddd"
                                        arcSweepAngle={240}
                                        rotation={240}
                                        lineCap="round"
                                    >
                                        {(fill) => (
                                            <View style={styles.gaugeTextContainer}>
                                                <MaterialIcons name="water-drop" size={24} color="blue"/>
                                                <Text style={styles.gaugeText}>{selectedPoint?.humidity}%</Text>
                                            </View>
                                        )}
                                    </AnimatedCircularProgress>
                                    <Text style={styles.gaugeLabelText}>Humidity</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <MaterialIcons name="close" size={20} color="white"/>
                                <Text style={styles.closeButtonText}>Close Details</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    container: {
        flex: 1,
        marginHorizontal: isTablet ? 30 : 15, // Increased margin for tablets
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: isTablet ? '70%' : '80%',
        maxWidth: isTablet ? 500 : 350, // Wider for tablets
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        overflow: 'hidden',
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: isTablet ? 30 : 20, // Adjusted spacing
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: primaryColor,
        paddingVertical: isTablet ? 20 : 15, // Adjusted padding
        paddingHorizontal: isTablet ? 30 : 20,
    },
    modalTitle: {
        color: 'white',
        fontSize: isTablet ? 22 : 18, // Larger title font for tablets
        fontWeight: 'bold',
        marginLeft: isTablet ? 15 : 10, // Adjusted spacing
    },
    modalContent: {
        padding: isTablet ? 30 : 20, // More padding for tablets
    },
    timestampText: {
        flexDirection: 'row',
        alignItems: 'center',
        color: 'gray',
        marginBottom: 20,
        textAlign: 'center',
        fontSize: isTablet ? 16 : 14, // Larger font size for tablets
    },
    gaugeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: isTablet ? 30 : 20, // Adjusted spacing
    },
    gaugeWrapper: {
        alignItems: 'center',
    },
    gaugeTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gaugeText: {
        fontSize: isTablet ? 18 : 16, // Larger font size for tablets
        fontWeight: 'bold',
        marginLeft: 5,
    },
    gaugeLabelText: {
        marginTop: 10,
        color: 'gray',
        fontSize: isTablet ? 16 : 14, // Adjusted font size
    },
    closeButton: {
        flexDirection: 'row',
        backgroundColor: '#e74c3c',
        padding: isTablet ? 16 : 12, // Increased padding
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: isTablet ? 20 : 15, // Adjusted spacing
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 10,
        fontSize: isTablet ? 18 : 16, // Adjusted font size
    },
    datePickerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: isTablet ? 15 : 10, // Adjusted vertical spacing
    },

    graphContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginVertical: isTablet ? 14 : 10,
    },
    scrollButton: {
        position: 'absolute',
        zIndex: 1,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: isTablet ? 12 : 8,
        borderRadius: isTablet ? 24 : 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
