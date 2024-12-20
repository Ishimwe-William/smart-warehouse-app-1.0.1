import React from "react";
import { Text, View } from "react-native";
import { styles } from "../utils/styles";


const MessagePopup = ({ text, type, visible, moreStyle = { top: 30 } }) => {
    if (!visible) return null;
    return (
        <View style={[styles.myMessagePopup, moreStyle, { backgroundColor: type === 'success' ? 'green' : 'red' }]}>
            <Text style={{ color: 'white', textAlign: "center" }}>{text}</Text>
        </View>
    )
}

export default MessagePopup;