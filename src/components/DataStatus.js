import {styles as baseStyles} from "../utils/styles";
import {View, Text, StyleSheet, Dimensions} from "react-native";

const {width, height} = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

export const DataStatus = ({statusColor, dataName, data}) => {
    return (
        <>
            <View style={styles.container}>
                <View style={styles.dataItem}>
                    <Text style={styles.label}>{dataName}:</Text>
                    <Text style={styles.value}>{data} {dataName === "Temperature" ? "°C" : "%"}</Text>
                </View>
                <View style={[baseStyles.statusIndicator, {backgroundColor: statusColor}]}/>
            </View>
            <View style={baseStyles.textContainer}/>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: isTablet ? 26 : 16,
        paddingHorizontal: isTablet ? 34 : 24,
    },
    dataItem: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    label: {
        fontSize: isTablet ? 24 : 16,
        fontWeight: "bold",
        marginBottom: 4,
    },
    value: {
        fontSize: isTablet ? 32 : 22,
        fontWeight: "bold",
    },
});