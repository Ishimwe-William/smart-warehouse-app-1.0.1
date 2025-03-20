import React, {useCallback, useEffect, useLayoutEffect, useState} from "react";
import {
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import SwitchSelector from "react-native-switch-selector";
import {highColor, lowColor, middleColor, primaryColor} from "../../utils/colors";
import {styles as baseStyles} from "../../utils/styles";
import {useNavigation} from "@react-navigation/native";
import {MyButton} from "../../components/MyButton";
import {useAuth} from "../../context/AuthContext";
import {fetchRequests, sendRequest} from "../../utils/firestoreUtil";
import {SafeAreaView} from "react-native-safe-area-context";
import {RequestStatusModal} from "../../components/RequestStatusModal";
import {RequestStatus} from "../../utils/RequestStatus";
import {saveNotificationToFirebase} from "../../utils/rtdbUtils";

export default function RequestsScreen() {
    const [selectedView, setSelectedView] = useState("all"); // Track selected view state
    const [isModalVisible, setModalVisible] = useState(false); // Modal visibility
    const [formData, setFormData] = useState({
        selectedOption: "",
        phone: "",
        name: "",
    });
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRequestId, setExpandedRequestId] = useState(null); // Track expanded request ID
    const navigation = useNavigation();
    const {user, userRole} = useAuth();

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Requests",
            headerLeft: undefined,
        });
    }, []);

    const handleSendRequest = () => {
        setModalVisible(true);
    };

    const handleCancel = () => {
        setModalVisible(false);
        setFormData({
            selectedOption: "",
            phone: "",
            name: "",
        });
    };

    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value,
        }));
    };

    const requestTypes = [
        {
            value: "Harvest Grain Check",
            description: "Request to check the condition of recently harvested grains.",
        },
        {
            value: "Grain Maturity Check",
            description: "Request to check if grains are mature for harvesting.",
        },
    ];


    const validateForm = () => {
        const {selectedOption, phone, name} = formData;

        if (!selectedOption) {
            Alert.alert("Validation Error", "Please select a request type.");
            return false;
        }

        if (!phone) {
            Alert.alert("Validation Error", "Please enter a phone number.");
            return false;
        }

        // Check if phone starts with 07 and has exactly 10 digits
        if (!/^07\d{8}$/.test(phone)) {
            Alert.alert(
                "Validation Error",
                "Phone number must start with '07' and have exactly 10 digits."
            );
            return false;
        }

        if (!name.trim()) {
            Alert.alert("Validation Error", "Please enter a name.");
            return false;
        }

        return true;
    };

    const handleSend = async () => {
        if (!validateForm()) return;

        try {
            const requestData = {
                type: formData.selectedOption,
                phone: formData.phone,
                name: formData.name,
                user_email: user?.email || "anonymous@example.com",
                user_id: user?.uid,
            };

            await sendRequest(requestData); // Use the Firestore helper function

            const notification = {
                type: `Request Sent Successfully`,
                message: `${requestData.type} request successfully sent to an Agronomist. You will be notified for an appointment.`,
                timestamp: new Date().toISOString(),
                measurementType: requestData.type.toLowerCase()
            };

            await saveNotificationToFirebase(notification, user.uid)

            Alert.alert("Success", "Your request has been sent successfully!");
            handleCancel(); // Close the modal
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to send request. Please try again.");
        }
    };

    // Fetch requests function
    const fetchRequestsData = useCallback(async () => {
        try {
            setIsLoading(true);
            const fetchedRequests = await fetchRequests({
                userEmail: user?.email,
                userRole: userRole,
            });

            // Filter requests based on selected view
            const filteredRequests = fetchedRequests.filter(request => {
                switch (selectedView) {
                    case 'all':
                        return true;
                    case 'harvest':
                        return request.type === 'Harvest Grain Check';
                    case 'grain':
                        return request.type === 'Grain Maturity Check';
                    case 'approved':
                        return request.status === 'approved';
                    case 'waiting':
                        return request.status === 'waiting';
                    default:
                        return true;
                }
            });

            setRequests(filteredRequests);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch requests");
        } finally {
            setIsLoading(false);
        }
    }, [user?.email, userRole, selectedView]);

    // Fetch requests on component mount and when view changes
    useEffect(() => {
        fetchRequestsData();

    }, [fetchRequestsData]);

    const handleToggleExpand = (id) => {
        // If the same ID is tapped, collapse it; otherwise, expand the new ID
        setExpandedRequestId((prevId) => (prevId === id ? null : id));
    };

    const formattedDate = (unformatedDate) => {
        const date = unformatedDate.toDate();
        return date
            ? `${date.getDate().toString().padStart(2, '0')}-${date.toLocaleString('en', {month: 'short'})}-${date.getFullYear().toString().substring(2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
            : 'Date not available';
    }

    const renderRequestItem = ({item}) => {
        const isExpanded = item.id === expandedRequestId;

        const statusColor =
            item.status === "waiting"
                ? lowColor
                : item.status === "approved"
                    ? middleColor
                    : highColor;

        const renderStatusAction = () => {
            if (item.status === "waiting") {
                if (userRole === "Admin" || userRole === "Agronomist") {
                    return <MyButton
                        ButtonText={"Respond"}
                        HandleOnPress={() => {
                            setSelectedRequestId(item.id);
                            setStatusModalVisible(true);
                            setUserId(item.user_id);
                        }}
                    />;
                }
                return <Text style={[baseStyles.subtitle, {color: lowColor}]}>Pending approval</Text>;
            }
            return (
                <Text style={[baseStyles.subtitle, {color: item.status === "approved" ? middleColor : highColor}]}>
                    {item.status === "approved" ? "Approved" : "Cancelled"}
                </Text>
            );
        };

        return (
            <>
                <View style={styles.requestItem}>
                    {/* Collapsed View */}
                    <TouchableOpacity onPress={() => handleToggleExpand(item.id)} style={styles.rowBetween}>
                        <Text style={styles.requestType}>{item.type}</Text>
                        <View style={[styles.statusIndicator, {backgroundColor: statusColor}]}/>
                        <Text style={styles.dateText}>Created: {formattedDate(item.created_at)}</Text>
                    </TouchableOpacity>

                    {/* Expanded View */}
                    {isExpanded && (
                        <>
                            <View style={styles.rowBetween}>
                                <View>
                                    <Text style={styles.requestDetails}>Name: {item.name}</Text>
                                    <Text style={styles.requestDetails}>Phone: {item.phone}</Text>
                                </View>
                                {renderStatusAction()}
                            </View>

                            {item.status !== RequestStatus.WAITING && (
                                <>
                                    <View style={styles.separator}/>
                                    <View style={styles.rowBetween}>
                                        <Text
                                            style={styles.requestInfo}>{item.status === RequestStatus.CANCELLED ? "Cancellation" : "Schedule"} Info:</Text>
                                        <Text style={styles.dateText}>Updated: {formattedDate(item.updated_at)}</Text>
                                    </View>
                                    {item.status === RequestStatus.APPROVED && (
                                        <View>
                                            <Text style={styles.requestDetails}>
                                                Time: {formattedDate(item.scheduled_date)}
                                            </Text>
                                            <View style={styles.rowBetween}>
                                                <Text style={[styles.requestDetails, {fontWeight: 'bold'}]}>Agronomist
                                                    Phone:</Text>
                                                <Text style={[styles.requestDetails, {fontWeight: 'bold'}]}>Agronomist
                                                    Email:</Text>
                                            </View>
                                            <View style={styles.rowBetween}>
                                                <Text style={styles.requestDetails}
                                                      dataDetectorType={'phoneNumber'}>{item.agronomist_phone}</Text>
                                                <Text style={styles.requestDetails}
                                                      dataDetectorType={'email'}>{item.agronomist_email}</Text>
                                            </View>
                                        </View>
                                    )}
                                    {item.status === RequestStatus.CANCELLED && (
                                        <View>
                                            <Text style={[styles.requestDetails, {fontWeight: 'bold'}]}>
                                                Reason:
                                            </Text>
                                            <Text style={styles.requestDetails} numberOfLines={4}
                                                  ellipsizeMode={'tail'}>
                                                {item?.cancellationReason}</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </View>
            </>
        );
    };

    const getOptions = () => {
        const baseOptions = [
            {label: "All\nRequests", value: "all"},
            {label: "Harvest\nGrain\nCheck", value: "harvest"},
            {label: "Grain\nMaturity\nCheck", value: "grain"},
            {label: "Approved Requests", value: "approved"},
        ];

        // Add "Waiting" option only for Admin or Agronomist roles
        if (userRole === "Admin" || userRole === "Agronomist") {
            baseOptions.push({label: "Waiting Requests", value: "waiting"});
        }

        return baseOptions;
    };

    const [options, setOptions] = useState(getOptions());

    // Recalculate options when userRole changes (if dynamic roles are possible)
    useEffect(() => {
        setOptions(getOptions());
    }, [userRole]);

    const renderData = () => {
        if (isLoading) {
            return <Text>Loading requests...</Text>;
        }

        if (requests.length === 0) {
            return <Text>No requests found.</Text>;
        }

        return (
            <FlatList
                data={requests}
                renderItem={renderRequestItem}
                keyExtractor={(item, index) => item.id || index.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={fetchRequestsData}
                        colors={[primaryColor]}
                    />
                }
            />
        );
    };

    return (
        <SafeAreaView style={[baseStyles.container]}>
            <View style={{alignSelf: 'flex-end', marginTop: -30}}>
                <MyButton ButtonText={"Send Request"} selected={true} HandleOnPress={handleSendRequest}/>
            </View>
            {/* Switch Selector */}
            <SwitchSelector
                options={options}
                initial={0}
                fontSize={12}
                height={50}
                borderRadius={0}
                onPress={(value) => setSelectedView(value)}
                buttonColor={primaryColor}
                backgroundColor="#fb8c00"
                textColor="#333"
                selectedColor="#FFF"
                style={styles.switchSelector}
            />
            {/* Render dynamic content */}
            <View style={styles.requestContainer}>
                {renderData()}
            </View>

            {/* Modal for Sending Requests */}
            <Modal visible={isModalVisible} animationType="slide" transparent>
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Send Request</Text>

                            {/* Option Field */}
                            <Text style={styles.label}>Select Request Type</Text>
                            {requestTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.optionButton,
                                        formData.selectedOption === type.value && styles.selectedOption,
                                    ]}
                                    onPress={() => handleInputChange("selectedOption", type.value)}
                                >
                                    <Text style={styles.optionText}>{type.value}</Text>
                                    {formData.selectedOption === type.value && (
                                        <Text style={styles.optionDescription}>{type.description}</Text>
                                    )}
                                </TouchableOpacity>
                            ))}

                            {/* Phone Input */}
                            <Text style={styles.label}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                maxLength={10}
                                placeholder="07xxxxxxxx"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={(text) => handleInputChange("phone", text)}
                            />

                            {/* Name Input */}
                            <Text style={styles.label}>Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter name or cooperative name"
                                value={formData.name}
                                onChangeText={(text) => handleInputChange("name", text)}
                            />

                            {/* Modal Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                                    <Text style={styles.buttonText}>Send</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </Modal>
            <RequestStatusModal
                visible={statusModalVisible}
                onClose={() => {
                    setStatusModalVisible(false);
                    setSelectedRequestId(null);
                }}
                requestId={selectedRequestId}
                onStatusUpdated={fetchRequestsData}
                userId={userId}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    requestItem: {
        marginVertical: 8,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 1},
        shadowRadius: 4,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    requestType: {
        fontSize: 16,
        fontWeight: "bold",
        borderRadius: 5,
        backgroundColor: 'rgba(250,139,1,0.15)',
        paddingHorizontal: 5,
        color: "#000",
    },
    requestInfo: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
    },
    statusIndicator: {
        height: 10,
        width: 10,
        borderRadius: 5,
    },
    dateText: {
        fontSize: 12,
        color: "#555",
    },
    requestDetails: {
        fontSize: 14,
        color: "#444",
    },
    separator: {
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 8,
    },
    scheduleTitle: {
        fontSize: 14,
        fontWeight: "600",
    },


    requestContainer: {
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 20
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    switchSelector: {
        marginBottom: 10,
        lineHeight: 3,
    },
    contentContainer: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    //
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginTop: 5,
    },
    hint: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
    },
    optionButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
    },
    selectedOption: {
        borderColor: primaryColor,
        backgroundColor: "#f5f5f5",
    },
    optionText: {
        fontSize: 14,
    },
    optionDescription: {
        fontSize: 12,
        color: "#666",
        marginTop: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: "#ccc",
        padding: 10,
        borderRadius: 5,
    },
    sendButton: {
        backgroundColor: primaryColor,
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
