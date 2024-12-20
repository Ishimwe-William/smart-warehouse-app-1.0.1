import {ActivityIndicator, Dimensions, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {primaryColor} from "../utils/colors";

const {width, height} = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

export const MyButton = ({HandleOnPress, ButtonText, isLoading, selected = false}) => {
    return (
        <View style={selected ? styles.selectedButtonContainer : styles.buttonContainer}>
            <TouchableOpacity onPress={HandleOnPress} disabled={isLoading}>
                {isLoading ? (
                    <ActivityIndicator size={isTablet ? 36 : 24} color={'#5A9AA9'}/>
                ) : (
                    <Text style={selected ? styles.selectedButtonText : styles.buttonText}>
                        {ButtonText}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonText: {
        textAlign: 'center',
        color: primaryColor,
        padding: isTablet ? 10 : 5,
        borderRadius: isTablet ? 10 : 5,
        borderWidth: 2,
        borderColor: primaryColor,
        fontSize: isTablet ? 16 : 14,
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: isTablet ? 18 : 10,
    },
    selectedButtonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#5A9AA9",
        marginVertical: isTablet ? 16 : 10,
        padding: 3,
        borderRadius: isTablet ? 8 : 5,
    },
    selectedButtonText: {
        textAlign: 'center',
        color: '#fff',
        padding: isTablet ? 8 : 5,
        borderRadius: isTablet ? 8 : 5,
        borderWidth: 1,
        borderColor: 'transparent',
        fontSize: isTablet ? 14 : 13,
    },
});
