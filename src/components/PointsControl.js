import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';

const PointsControl = ({initialPoints = 5, minPoints = 3, maxPoints = 20, onPointsChange, setShowDots, showDots}) => {
    const [points, setPoints] = useState(initialPoints);

    const handlePointsChange = (increment) => {
        const newPoints = points + increment;
        if (newPoints >= minPoints && newPoints <= maxPoints) {
            setPoints(newPoints);
            onPointsChange(newPoints);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Data Points:</Text>
            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.button, points <= minPoints && styles.buttonDisabled]}
                    onPress={() => handlePointsChange(-1)}
                    disabled={points <= minPoints}
                >
                    <MaterialIcons
                        name="remove"
                        size={24}
                        color={points <= minPoints ? "#ccc" : "#5A9AA9"}
                    />
                </TouchableOpacity>

                <Text style={styles.pointsText}>{points}</Text>

                <TouchableOpacity
                    style={[styles.button, points >= maxPoints && styles.buttonDisabled]}
                    onPress={() => handlePointsChange(1)}
                    disabled={points >= maxPoints}
                >
                    <MaterialIcons
                        name="add"
                        size={24}
                        color={points >= maxPoints ? "#ccc" : "#5A9AA9"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, points >= maxPoints && styles.buttonDisabled]}
                    onPress={() => setShowDots(!showDots)}
                    disabled={points >= maxPoints}
                >
                    <MaterialIcons
                        name={showDots ? "check-box" : "check-box-outline-blank"}
                        size={24}
                        color={points >= maxPoints ? "#ccc" : "#5A9AA9"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
    },
    label: {
        marginRight: 10,
        fontSize: 16,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 4,
    },
    button: {
        padding: 8,
        borderRadius: 4,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    pointsText: {
        marginHorizontal: 15,
        fontSize: 16,
        minWidth: 24,
        textAlign: 'center',
    }
});

export default PointsControl;