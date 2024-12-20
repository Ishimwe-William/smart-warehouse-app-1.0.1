import {StyleSheet, Dimensions} from "react-native";

const {width, height} = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: "flex-start",
        paddingHorizontal: isTablet ? 40 : 20,
        paddingVertical: isTablet ? 20 : 10,
    },
    title: {
        fontSize: isTablet ? 32 : 24,
        marginBottom: isTablet ? 30 : 20,
        textAlign: 'center',
    },
    dashData: {
        fontSize: isTablet ? 36 : 30,
        textAlign: 'center',
    },
    statusIndicator: {
        width: isTablet ? 32 : 20,
        height: isTablet ? 32 : 20,
        borderRadius: isTablet ? 16 : 12,
    },
    colorItem: {
        alignItems: 'center',
        marginHorizontal: isTablet ? 20 : 12,
    },
    subtitle: {
        fontSize: isTablet ? 20 : 16,
        padding: isTablet ? 20 : 15,
        fontWeight: '300',
        textAlign: 'center',
    },
    text: {
        fontSize: isTablet ? 22 : 18,
        fontWeight: '400',
    },
    input: {
        borderWidth: 1,
        borderColor: 'gray',
        padding: isTablet ? 15 : 10,
        marginBottom: isTablet ? 15 : 10,
        borderRadius: isTablet ? 8 : 5,
    },
    errorText: {
        color: 'red',
        marginBottom: isTablet ? 15 : 10,
    },
    myButton: {
        backgroundColor: '#5A9AA9',
        height: isTablet ? 60 : 50,
        marginVertical: isTablet ? 15 : 10,
        justifyContent: 'center',
        marginHorizontal: isTablet ? 20 : 15,
        borderRadius: isTablet ? 30 : 24,
    },
    mySmallButton: {
        paddingHorizontal: isTablet ? 10 : 5,
        margin: isTablet ? 10 : 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    myButtonText: {
        fontWeight: "bold",
        fontSize: isTablet ? 20 : 16,
        textAlign: "center",
        color: "#fff"
    },
    floatButton: {
        position: 'absolute',
        borderRadius: isTablet ? 30 : 25,
        width: isTablet ? 70 : 60,
        height: isTablet ? 70 : 60,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: 'orange',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 1,
        shadowRadius: 10.84,
        zIndex: 100,
    },
    floatButtonText: {
        fontSize: isTablet ? 18 : 14,
        fontWeight: 'bold',
        textAlign: 'center',
        justifyContent: 'center',
    },
    myMessagePopup: {
        padding: isTablet ? 15 : 10,
        position: 'absolute',
        right: 0,
        zIndex: 1,
        borderRadius: isTablet ? 8 : 5,
        marginHorizontal: isTablet ? 25 : 20,
        opacity: 0.8,
    },
    myCircleLogo: {
        width: isTablet ? 150 : 110,
        height: isTablet ? 150 : 110,
        marginVertical: isTablet ? 30 : 20,
        borderRadius: isTablet ? 75 : 55,
    },
    row: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    textContainer: {
        marginHorizontal: isTablet ? 25 : 15,
        marginBottom: isTablet ? 15 : 10,
        borderColor: '#b6b6b6',
        borderTopWidth: 2,
        borderRadius: isTablet ? 8 : 5,
    },
    orderItem: {
        padding: isTablet ? 15 : 10,
        marginHorizontal: isTablet ? 30 : 20,
        marginVertical: isTablet ? 10 : 5,
        borderRadius: isTablet ? 15 : 10,
        borderWidth: 1,
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: isTablet ? '80%' : '70%',
        backgroundColor: 'white',
        padding: isTablet ? 30 : 20,
        borderRadius: isTablet ? 15 : 10,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: isTablet ? 8 : 5,
        borderColor: '#ccc',
        padding: isTablet ? 15 : 10,
        marginBottom: isTablet ? 15 : 10,
    },
    dateText: {
        fontWeight: "300",
        fontSize:isTablet ? 14 : 12,
    },

});
