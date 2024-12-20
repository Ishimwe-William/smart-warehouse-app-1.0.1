import { TouchableOpacity, Text, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isTablet = Math.min(width, height) >= 600;

export const LinkButton = ({ title, onClick, size = 24, weight = "300", color = '#5A9AA9' }) => {
    const computedSize = isTablet ? size * 1.2 : size; // Scale size for tablets
    const computedWeight = isTablet ? "400" : weight; // Slightly heavier weight for tablets

    return (
        <TouchableOpacity style={{ marginVertical: isTablet ? 15 : 10 }} onPress={onClick}>
            <Text
                style={{
                    textAlign: "center",
                    color: color,
                    fontSize: computedSize,
                    fontWeight: computedWeight
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
};
