import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";


export default function CarBookingsScreen({ navigation, route }) {
    const { t } = useTranslation();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { car, user } = route.params || {};

    if (!car) {
        return (
            <View style={styles.centered}>
                <MaterialIcons name="error" size={64} color="#ff6b6b" />
                <FarsiText style={styles.errorText}>{t('messages.noCar')}</FarsiText>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>{t('messages.goBack')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,
                },
                body: JSON.stringify({
                    car_id: car.car_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(Array.isArray(data) ? data : []);
            } else {
                Alert.alert(t('messages.error'), t('messages.failFetchBooking'));
            }
        } catch (error) {
            Alert.alert(t('messages.NetError'), t('messages.checkConnection'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'ongoing':
                return '#4CAF50';
            case 'completed':
                return '#2196F3';
            case 'cancelled':
                return '#ff6b6b';
            default:
                return '#ff9800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
            case 'ongoing':
                return 'flash-on';
            case 'completed':
                return 'check-circle';
            case 'cancelled':
                return 'cancel';
            default:
                return 'schedule';
        }
    };

    const renderBooking = ({ item }) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <View style={styles.locationContainer}>
                    <MaterialIcons name="location-on" size={20} color="#667eea" />
                    <Text style={styles.locationText}>{item.street + item.city || 'Unknown Location'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <MaterialIcons name={getStatusIcon(item.status)} size={16} color="#fff" />
                    <Text style={styles.statusText}>{item.status || 'Success'}</Text>
                </View>
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                    <MaterialIcons name="schedule" size={16} color="#666" />
                    <Text style={styles.detailText}>{item.date || 'Date not specified'}</Text>
                </View>
                {item.duration && (
                    <View style={styles.detailRow}>
                        <MaterialIcons name="timer" size={16} color="#666" />
                        <Text style={styles.detailText}>{item.duration}</Text>
                    </View>
                )}
                {item.price && (
                    <View style={styles.detailRow}>
                        <MaterialIcons name="attach-money" size={16} color="#666" />
                        <Text style={styles.detailText}>${item.price}</Text>
                    </View>
                )}
            </View>

            <View style={styles.bookingActions}>
                <TouchableOpacity style={styles.viewButton}>
                    <MaterialIcons name="visibility" size={16} color="#667eea" />
                    <Text style={styles.viewButtonText}>{t('messages.view')}</Text>
                </TouchableOpacity>
                {item.status?.toLowerCase() === 'active' && (
                    <TouchableOpacity style={styles.endButton}>
                        <MaterialIcons name="stop" size={16} color="#ff6b6b" />
                        <Text style={styles.endButtonText}>{t('messages.end')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <MaterialIcons name="history" size={64} color="#ccc" />
                <Text style={styles.loadingText}>{t('messages.loadingBooking')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.carInfoHeader}>
                    <MaterialIcons name="directions-car" size={32} color="#667eea" />
                    <View style={styles.carDetails}>
                        <Text style={styles.title}>{car.model}</Text>
                        <Text style={styles.subtitle}>{car.license_plate} • {car.year} • {car.color}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.addBookingButton}
                    onPress={() => navigation.navigate('FindChargerLocationsScreenForCar', { car, user })}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#43e97b', '#38f9d7']}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.addBookingText}>{t('messages.newBooking')}</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {bookings.length === 0 ? (
                <View style={styles.centered}>
                    <MaterialIcons name="event_busy" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>{t('messages.noBooking')}</Text>
                    <Text style={styles.emptySubtext}>
                        {t('messages.startSession')}
                    </Text>
                    <TouchableOpacity
                        style={styles.getStartedButton}
                        onPress={() => navigation.navigate('FindChargerLocationsScreenForCar', { car, user })}
                    >
                        <Text style={styles.getStartedText}>{t('messages.findCharger')}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    carInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    carDetails: {
        marginLeft: 12,
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
    },
    addBookingButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    addBookingText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    listContainer: {
        padding: 20,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 6,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 4,
    },
    bookingDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    bookingActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f0f4ff',
    },
    viewButtonText: {
        fontSize: 14,
        color: '#667eea',
        marginLeft: 4,
        fontWeight: '600',
    },
    endButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#fff0f0',
    },
    endButtonText: {
        fontSize: 14,
        color: '#ff6b6b',
        marginLeft: 4,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff6b6b',
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        backgroundColor: '#667eea',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    getStartedButton: {
        backgroundColor: '#667eea',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    getStartedText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
