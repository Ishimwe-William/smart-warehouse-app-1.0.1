import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { MyButton } from './MyButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { styles as baseStyles } from '../utils/styles';

export const TimeframeSelector = ({
                                      timeframe,
                                      setTimeframe,
                                      customStartDate,
                                      setCustomStartDate,
                                      customEndDate,
                                      setCustomEndDate
                                  }) => {
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const styles = {
        buttonGroup: {
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
        },
        datePickerRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginVertical: 10,
        }
    };

    return (
        <>
            <View style={styles.buttonGroup}>
                {["1hr", "1day", "1week", "1month", "custom"].map((tf) => (
                    <MyButton
                        key={tf}
                        ButtonText={tf}
                        HandleOnPress={() => setTimeframe(tf)}
                        selected={timeframe === tf}
                    />
                ))}
            </View>

            {timeframe === "custom" && (
                <View>
                    <View style={[baseStyles.row, { justifyContent: 'space-between' }]}>
                        <MyButton
                            ButtonText={'Start Date'}
                            selected={true}
                            HandleOnPress={() => setShowStartDatePicker(true)}
                        />
                        <Text>{customStartDate.toLocaleString()}</Text>
                    </View>
                    <View style={styles.datePickerRow}>
                        <MyButton
                            ButtonText="End Date"
                            selected={true}
                            HandleOnPress={() => setShowEndDatePicker(true)}
                        />
                        <Text>{customEndDate.toLocaleString()}</Text>
                    </View>

                    {showStartDatePicker && (
                        <DateTimePicker
                            value={customStartDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowStartDatePicker(false);
                                if (selectedDate) setCustomStartDate(selectedDate);
                            }}
                        />
                    )}

                    {showEndDatePicker && (
                        <DateTimePicker
                            value={customEndDate}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowEndDatePicker(false);
                                if (selectedDate) setCustomEndDate(selectedDate);
                            }}
                        />
                    )}
                </View>
            )}
        </>
    );
};