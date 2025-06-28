import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import env from '../../config/environment';

export default function MyBookingsScreen({ navigation, route }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = route.params || {};

    useEffect(() => {
        if (user) {
            console.log('Fetching bookings for user:', user.user_id);
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    car_owner_user_id: user.user_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data || []);
            } else {
                Alert.alert('Error', 'Failed to fetch bookings');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error for this request ');
        } finally {
            setLoading(false);
        }
    };

    const handleEndBooking = (booking) => {
        navigation.navigate('EndBooking', {
            booking,
            user,
            onBookingEnded: fetchBookings
        });
    };
    const renderBooking = ({ item }) => (
        <View style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>Booking #{item.booking_id}</Text>
            <Text>Car ID: {item.car_id}</Text>
            <Text>Location ID: {item.charging_location_id}</Text>
            <Text>Start: {new Date(item.start_time).toLocaleString()}</Text>
            {item.end_time ? (
                <Text>End: {new Date(item.end_time).toLocaleString()}</Text>
            ) : (
                <View style={styles.activeBooking}>
                    <Text style={styles.activeText}>Active Booking</Text>
                    <TouchableOpacity
                        style={styles.endButton}
                        onPress={() => handleEndBooking(item)}
                    >
                        <MaterialIcons name="stop" size={20} color="#fff" />
                        <Text style={styles.endButtonText}>End Booking</Text>
                    </TouchableOpacity>
                </View>
            )}
            {item.review_rate && (
                <Text>Rating: {item.review_rate}</Text>
            )}
            {item.review_message && (
                <Text>Review: {item.review_message}</Text>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text>Loading bookings...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Bookings</Text>
            {bookings.length === 0 ? (
                <View style={styles.centered}>
                    <Text>No bookings found</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.booking_id.toString()}
                    refreshing={loading}
                    onRefresh={fetchBookings}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    bookingCard: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    bookingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    activeBooking: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    activeText: {
        color: '#28a745',
        fontWeight: 'bold',
    },
    endButton: {
        backgroundColor: '#dc3545',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    endButtonText: {
        color: '#fff',
        marginLeft: 4,
        fontSize: 12,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
