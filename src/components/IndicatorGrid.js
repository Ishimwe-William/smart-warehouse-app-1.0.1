import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {styles as baseStyles} from "../utils/styles";


const {width, height} = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

const IndicatorGrid = ({highColor, middleColor, lowColor}) => {
    return (
        <View style={[baseStyles.container,{alignItems: "flex-end",}]}>
            <View style={styles.row}>
                <Text/>
                <View style={styles.indicatorContainer}>
                    <Text style={styles.label}>High</Text>
                    <View style={[baseStyles.statusIndicator, {width: 15, height: 15}, {backgroundColor: highColor}]}/>
                </View>
            </View>

            <View style={styles.row}>
                <Text/>
                <View style={styles.indicatorContainer}>
                    <Text style={styles.label}>Normal</Text>
                    <View
                        style={[baseStyles.statusIndicator, {width: 15, height: 15}, {backgroundColor: middleColor}]}/>
                </View>
            </View>

            <View style={styles.row}>
                <Text/>
                <View style={styles.indicatorContainer}>
                    <Text style={styles.label}>Low</Text>
                    <View style={[baseStyles.statusIndicator, {width: 15, height: 15}, {backgroundColor: lowColor}]}/>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: isTablet ? 18 : 12,
        marginBottom: 4,
    },
    indicatorContainer: {
        flexDirection: 'row', // Ensures the text and indicator are side by side
        alignItems: 'center',
        gap: 8, // Adds spacing between text and indicator
    },
    indicatorText: {
        fontSize: 14,
        marginRight: 8, // Adds space between the text and the indicator
    },
});

export default IndicatorGrid;
