// NotificationsScreen.js
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {useNavigation} from "@react-navigation/native";
import {Feather} from "@expo/vector-icons";
import {useAuth} from '../context/AuthContext';
import {useNotification} from '../context/NotificationContext';
import {
    deleteMultipleNotifications,
    deleteNotification,
    fetchAllNotifications,
    markNotificationAsRead
} from "../utils/rtdbUtils";

const NotificationItem = ({notification, onPress, onLongPress, selected}) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'Temperature Threshold Alert':
                return 'thermometer';
            case 'Humidity Threshold Alert':
                return 'droplet';
            case 'Threshold Update':
                return 'settings';
            default:
                return 'bell';
        }
    };

    const getTypeColor = () => {
        if (notification.type.includes('Temperature')) return '#ff6b6b';
        if (notification.type.includes('Humidity')) return '#4dabf7';
        if (notification.type.includes('Threshold')) return '#51cf66';
        return '#868e96';
    };

    return (
        <TouchableOpacity
            style={[
                styles.notificationItem,
                !notification.read && styles.unreadNotification,
                selected && styles.selectedNotification // Apply selected style
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <View style={styles.iconContainer}>
                <Feather
                    name={getIcon()}
                    size={24}
                    color={getTypeColor()}
                />
            </View>
            <View style={styles.notificationContent}>
                <View style={styles.notificationHeader}>
                    <Text style={styles.notificationType}>
                        {notification.isGeneral ? "General" : "Personal"}
                    </Text>
                    <Text style={styles.timestamp}>
                        {new Date(notification.timestamp).toLocaleString()}
                    </Text>
                </View>
                <Text style={styles.message}>{notification.message}</Text>
                {notification.value && (
                    <Text style={styles.value}>
                        Value: {notification.value}
                        {notification.measurementType === 'temperature' ? '°C' : '%'}
                    </Text>
                )}
                {notification.changes && (
                    <View style={styles.changesContainer}>
                        <Text style={styles.changesTitle}>Updated Thresholds:</Text>
                        <Text style={styles.changesText}>
                            Temperature: {notification.changes.temperature.low}°C
                            - {notification.changes.temperature.high}°C
                        </Text>
                        <Text style={styles.changesText}>
                            Humidity: {notification.changes.humidity.low}% - {notification.changes.humidity.high}%
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

export const NotificationsScreen = () => {
    const navigation = useNavigation();
    const {user} = useAuth();
    const {clearNewAlertsFlag} = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'general', 'personal'
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    // Add delete confirmation dialog
    const confirmDelete = (notification) => {
        Alert.alert(
            'Delete Notification',
            'Are you sure you want to delete this notification?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => handleDelete(notification)
                }
            ]
        );
    };

    // Handle single notification deletion
    const handleDelete = async (notification) => {
        try {
            await deleteNotification(notification.id, user.uid, notification.isGeneral);
            setNotifications(prev =>
                prev.filter(n => n.id !== notification.id)
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to delete notification. Please try again.');
        }
    };

    // Handle bulk deletion
    const handleBulkDelete = async () => {
        Alert.alert(
            'Delete Notifications',
            `Are you sure you want to delete ${selectedNotifications.length} notifications?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteMultipleNotifications(selectedNotifications, user.uid);
                            setNotifications(prev =>
                                prev.filter(n => !selectedNotifications.some(selected => selected.id === n.id))
                            );
                            setSelectedNotifications([]);
                            setIsSelectionMode(false);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete notifications. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    const loadNotifications = useCallback(async () => {
        if (user) {
            try {
                const fetchedNotifications = await fetchAllNotifications(user.uid);
                setNotifications(fetchedNotifications);
                clearNewAlertsFlag();
            } catch (error) {
                console.error('Error loading notifications:', error);
                Alert.alert('Error', 'Failed to load notifications. Please try again.');
            }
        }
    }, [user]);

    const handleNotificationLongPress = (notification) => {
        Alert.alert(
            'Notification Options',
            'Choose an action',
            [
                {
                    text: 'Mark all as read',
                    onPress: async () => {
                        try {
                            const promises = notifications
                                .filter(n => !n.read)
                                .map(n => markNotificationAsRead(n.id, user.uid, n.isGeneral));
                            await Promise.all(promises);
                            setNotifications(prev =>
                                prev.map(n => ({...n, read: true}))
                            );
                        } catch (error) {
                            console.error('Error marking all as read:', error);
                            Alert.alert('Error', 'Failed to mark notifications as read.');
                        }
                    }
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => confirmDelete(notification)
                },
                {
                    text: 'Enter Selection Mode',
                    onPress: () => {
                        setIsSelectionMode(true);
                        setSelectedNotifications([{id: notification.id, isGeneral: notification.isGeneral}]);
                    }
                },
                {text: 'Cancel', style: 'cancel'}
            ]
        );
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    }, [loadNotifications]);

    useEffect(() => {
        loadNotifications().finally(() => setLoading(false));
    }, [loadNotifications]);

    const handleNotificationPress = async (notification) => {
        if (!notification.read) {
            try {
                await markNotificationAsRead(
                    notification.id,
                    user.uid,
                    notification.isGeneral
                );
                // Update local state
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notification.id
                            ? {...n, read: true}
                            : n
                    )
                );
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'general') return notification.isGeneral;
        if (filter === 'personal') return !notification.isGeneral;
        return true;
    });

    const renderNotificationItem = ({item}) => (
        <NotificationItem
            notification={item}
            onPress={() => {
                if (isSelectionMode) {
                    handleSelection(item);
                } else {
                    handleNotificationPress(item);
                }
            }}
            onLongPress={() => handleNotificationLongPress(item)}
            selected={selectedNotifications.some(n => n.id === item.id)}
            selectionMode={isSelectionMode}
        />
    );

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: "Notifications",
            headerRight: isSelectionMode ? () => (
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        onPress={handleBulkDelete}
                        style={styles.headerButton}
                    >
                        <Feather name="trash-2" size={24} color="red"/>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            setIsSelectionMode(false);
                            setSelectedNotifications([]);
                        }}
                        style={styles.headerButton}
                    >
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            ) : undefined

        });
    }, [isSelectionMode, selectedNotifications]);


    const handleSelection = (notification) => {
        setSelectedNotifications(prev => {
            const isSelected = prev.some(n => n.id === notification.id);
            if (isSelected) {
                const newSelection = prev.filter(n => n.id !== notification.id);
                if (newSelection.length === 0) {
                    setIsSelectionMode(false);
                }
                return newSelection;
            } else {
                return [...prev, {id: notification.id, isGeneral: notification.isGeneral}];
            }
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                {['all', 'general', 'personal'].map((filterType) => (
                    <TouchableOpacity
                        key={filterType}
                        style={[
                            styles.filterButton,
                            filter === filterType && styles.filterButtonActive
                        ]}
                        onPress={() => setFilter(filterType)}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            filter === filterType && styles.filterButtonTextActive
                        ]}>
                            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <FlatList
                data={filteredNotifications}
                renderItem={renderNotificationItem}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Feather name="bell-off" size={48} color="#ccc"/>
                        <Text style={styles.emptyText}>No notifications</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 8,
        backgroundColor: 'white',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 4,
        marginHorizontal: 4,
    },
    filterButtonActive: {
        backgroundColor: '#e7f5ff',
    },
    filterButtonText: {
        color: '#495057',
        fontWeight: '500',
    },
    filterButtonTextActive: {
        color: '#228be6',
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 16,
        marginVertical: 4,
        marginHorizontal: 8,
        borderRadius: 8,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.2,
                shadowRadius: 2,
            },
            android: {
                elevation: 2,
            },
        }),
    },
    iconContainer: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadNotification: {
        backgroundColor: '#f8f9fa',
        borderLeftWidth: 4,
        borderLeftColor: '#228be6',
    },
    notificationContent: {
        flex: 1,
        gap: 8,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    notificationType: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
    message: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    value: {
        fontSize: 14,
        color: '#666',
    },
    changesContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
    },
    changesTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 4,
    },
    changesText: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    headerButton: {
        marginHorizontal: 8,
    },
    cancelButton: {
        color: '#007AFF',
        fontSize: 16,
    },
    selectionIndicator: {
        position: 'absolute',
        right: 8,
        top: 8,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#007AFF',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedIndicator: {
        backgroundColor: '#007AFF',
    },
    checkmark: {
        color: 'white',
    },
    selectedNotification: {
        backgroundColor: '#e0f7fa', // Light teal background for selected items
        borderColor: '#00796b', // Border to indicate selection
        borderWidth: 1,
    },
});