import React, {useState} from 'react';
import {Alert, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import {lowColor, primaryColor} from '../utils/colors';
import {updateRequestStatus} from '../utils/firestoreUtil';
import {RequestStatus} from "../utils/RequestStatus";
import {useAuth} from "../context/AuthContext";
import {styles as baseStyles} from "../utils/styles";

export const RequestStatusModal = ({
                                       visible,
                                       onClose,
                                       requestId,
                                       onStatusUpdated
                                   }) => {
    const [mode, setMode] = useState('approve');
    const {user} = useAuth();
    const [useLoggedInEmail, setUseLoggedInEmail] = useState(true);
    const [formData, setFormData] = useState({
        agronomistPhone: '',
        scheduledDate: new Date(),
        cancellationReason: '',
        notes: '',
        agronomist_email: '',
    });

    const handleSubmit = async () => {
        try {
            if (!useLoggedInEmail) {
                if (!formData.agronomist_email) {
                    Alert.alert('Error', 'Please enter an email address');
                    return;
                }
                if (!validateEmail(formData.agronomist_email)) {
                    Alert.alert('Error', 'Please enter a valid email address');
                    return;
                }
            }

            // Phone number validation
            if (mode === 'approve') {
                if (!/^07\d{8}$/.test(formData.agronomistPhone)) {
                    Alert.alert('Error', 'Please enter a valid phone number starting with 07 and followed by 8 digits.');
                    return;
                }
            }

            const statusData = {
                status: mode === 'approve' ? RequestStatus.APPROVED : RequestStatus.CANCELLED,
                ...(mode === 'approve' ? {
                    agronomistPhone: formData.agronomistPhone,
                    scheduledDate: formData.scheduledDate,
                    notes: formData.notes,
                    agronomist_email: useLoggedInEmail ? user.email : formData.agronomist_email
                } : {
                    cancellationReason: formData.cancellationReason
                })
            };

            await updateRequestStatus(requestId, statusData);
            Alert.alert(
                'Success',
                `Request ${mode === 'approve' ? 'approved' : 'cancelled'} successfully`
            );
            onStatusUpdated();
            onClose();
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };


    const handleShowDatePicker = () => {
        DateTimePickerAndroid.open({
            value: formData.scheduledDate,
            onChange: (event, selectedDate) => {
                if (event.type === 'dismissed') {
                    return;
                }
                if (selectedDate) {
                    showTimePicker(selectedDate);
                }
            },
            mode: 'date',
            minimumDate: new Date()
        });
    };

    const showTimePicker = (selectedDate) => {
        DateTimePickerAndroid.open({
            value: selectedDate || formData.scheduledDate,
            onChange: (event, selectedTime) => {
                if (event.type === 'dismissed') {
                    return;
                }
                if (selectedTime && selectedDate) {
                    const combinedDateTime = new Date(selectedDate);
                    combinedDateTime.setHours(selectedTime.getHours());
                    combinedDateTime.setMinutes(selectedTime.getMinutes());
                    setFormData(prev => ({...prev, scheduledDate: combinedDateTime}));
                }
            },
            mode: 'time',
            is24Hour: true
        });
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const formatDateTime = (date) => {
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })}`;
    };

    const renderApprovalForm = () => (
        <>
            <View style={baseStyles.row}>
                <Text style={baseStyles.buttonText}>Use my email ({user.email})</Text>
                <Switch
                    value={useLoggedInEmail}
                    onValueChange={(newValue) => {
                        setUseLoggedInEmail(newValue);
                        if (newValue) {
                            setFormData(prev => ({...prev, agronomist_email: ''}));
                        }
                    }}
                    trackColor={{false: '#767577', true: primaryColor}}
                    thumbColor={useLoggedInEmail ? '#f4f3f4' : '#f4f3f4'}
                />
            </View>

            {!useLoggedInEmail && (
                <>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.agronomist_email}
                        onChangeText={(text) => setFormData(prev => ({...prev, agronomist_email: text}))}
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </>
            )}

            <Text style={styles.label}>Agronomist Phone Number</Text>
            <TextInput
                style={styles.input}
                value={formData.agronomistPhone}
                onChangeText={(text) => setFormData(prev => ({...prev, agronomistPhone: text}))}
                placeholder="07xxxxxxxx"
                maxLength={10}
                keyboardType="phone-pad"
            />

            <Text style={styles.label}>Schedule Meeting Date and Time</Text>
            <TouchableOpacity
                style={styles.dateButton}
                onPress={handleShowDatePicker}
            >
                <Text>{formatDateTime(formData.scheduledDate)}</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>Tap to select date and time</Text>

            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({...prev, notes: text}))}
                placeholder="Enter any additional notes"
                multiline
            />
        </>
    );

    const renderCancellationForm = () => (
        <>
            <Text style={styles.label}>Reason for Cancellation</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.cancellationReason}
                onChangeText={(text) => setFormData(prev => ({...prev, cancellationReason: text}))}
                placeholder="Enter reason for cancellation"
                multiline
            />
        </>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <ScrollView>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {mode === 'approve' ? 'Approve Request' : 'Cancel Request'}
                        </Text>

                        <View style={styles.toggleContainer}>
                            <TouchableOpacity
                                style={[styles.toggleButton, mode === 'approve' && styles.toggleButtonActive]}
                                onPress={() => setMode('approve')}
                            >
                                <Text
                                    style={[styles.toggleButtonText, mode === 'approve' && styles.toggleButtonTextActive]}>
                                    Approve
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.toggleButton, mode === 'cancel' && styles.toggleButtonActive]}
                                onPress={() => setMode('cancel')}
                            >
                                <Text
                                    style={[styles.toggleButtonText, mode === 'cancel' && styles.toggleButtonTextActive]}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {mode === 'approve' ? renderApprovalForm() : renderCancellationForm()}

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.buttonText}>Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.submitButton]}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
        paddingVertical: 5,
    },
    switchLabel: {
        flex: 1,
        fontSize: 14,
        marginRight: 10,
    },
    hint: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        marginLeft: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    toggleContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    toggleButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    toggleButtonActive: {
        backgroundColor: primaryColor,
    },
    toggleButtonText: {
        color: '#666',
    },
    toggleButtonTextActive: {
        color: '#fff',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginTop: 5,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateButton: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: lowColor,
    },
    submitButton: {
        backgroundColor: primaryColor,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});