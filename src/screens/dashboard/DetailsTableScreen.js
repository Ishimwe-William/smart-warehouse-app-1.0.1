import React from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from "react-native";

import {useWarehouseData} from '../../hooks/useWarehouseData';
import {TimeframeSelector} from '../../components/TimeframeSelector';
import {styles as baseStyles} from '../../utils/styles';
import {useLayoutEffect} from "react";
import {useNavigation} from "@react-navigation/native";

const {width, height} = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

export const DetailsTableScreen = () => {
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
    const navigation = useNavigation();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Warehouse Raw Data",
        });
    }, []);

    const renderRow = ({item}) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.createdAt}</Text>
            <Text style={styles.cell}>{item.temperature} °C</Text>
            <Text style={styles.cell}>{item.humidity} %</Text>
        </View>
    );


    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <TimeframeSelector
                    timeframe={timeframe}
                    setTimeframe={setTimeframe}
                    customStartDate={customStartDate}
                    setCustomStartDate={setCustomStartDate}
                    customEndDate={customEndDate}
                    setCustomEndDate={setCustomEndDate}
                />

                <View style={styles.table}>
                    <View style={styles.row}>
                        <Text style={styles.headerCell}>Date</Text>
                        <Text style={styles.headerCell}>Temperature</Text>
                        <Text style={styles.headerCell}>Humidity</Text>
                    </View>
                    {isLoading ? (
                        <ActivityIndicator size="large"/>
                    ) : data.length === 0 ? (
                        <Text style={baseStyles.subtitle}>No data found in {`${timeframe} time`}</Text>
                    ) : (
                        <FlatList
                            data={data}
                            renderItem={renderRow}
                            keyExtractor={(item) => item.id.toString()}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginHorizontal: isTablet ? 30 : 15, // Increased margin for tablets
    },
    buttonGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: isTablet ? 30 : 20, // More spacing for tablets
    },
    datePickerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginVertical: isTablet ? 15 : 10, // Adjusted vertical spacing
    },
    table: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        marginVertical: isTablet ? 10 : 5, // Added margin for better tablet visuals
    },
    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        paddingVertical: isTablet ? 12 : 8, // Increased padding for better readability
    },
    cell: {
        flex: 1,
        padding: isTablet ? 15 : 10, // Adjusted padding
        textAlign: "center",
        fontSize: isTablet ? 16 : 14, // Larger font for tablets
    },
    headerCell: {
        flex: 1,
        padding: isTablet ? 15 : 10, // Adjusted padding
        textAlign: "center",
        fontWeight: "bold",
        fontSize: isTablet ? 18 : 14, // Larger header font for tablets
    },
});