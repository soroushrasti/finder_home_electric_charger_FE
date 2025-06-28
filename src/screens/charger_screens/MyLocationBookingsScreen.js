import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import env from '../../config/environment';

export default function MyLocationBookingsScreen({ navigation, route }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = route.params?.user;

    useEffect(() => {
        if (user) {
            console.log('Fetching location bookings for user:', user.user_id);
            fetchLocationBookings();
        }
    }, [user]);

    const fetchLocationBookings = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    charger_location_owner_user_id: user.user_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);
                setBookings(data || []);
            } else {
                Alert.alert('Error', 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Network error:', error);
            Alert.alert('Error', 'Network error for this request');
        } finally {
            setLoading(false);
        }
    };

    const renderBooking = ({ item }) => (
        <View style={styles.bookingCard}>
            <Text style={styles.bookingTitle}>Booking #{item.booking_id}</Text>
            <Text>Car ID: {item.car_id}</Text>
            <Text>Location ID: {item.charging_location_id}</Text>
            <Text>Start: {new Date(item.start_time).toLocaleString()}</Text>
            {item.end_time ? (
                <View>
                    <Text>End: {new Date(item.end_time).toLocaleString()}</Text>
                    <View style={styles.completedBooking}>
                        <MaterialIcons name="check-circle" size={16} color="#28a745" />
                        <Text style={styles.completedText}>Completed</Text>
                    </View>
                    {item.review_rate && (
                        <View style={styles.reviewContainer}>
                            <Text>Rating: {item.review_rate}/5</Text>
                            <View style={styles.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <MaterialIcons
                                        key={star}
                                        name={star <= parseInt(item.review_rate) ? 'star' : 'star-border'}
                                        size={16}
                                        color={star <= parseInt(item.review_rate) ? '#FFD700' : '#ccc'}
                                    />
                                ))}
                            </View>
                        </View>
                    )}
                    {item.review_message && (
                        <Text style={styles.reviewMessage}>Review: "{item.review_message}"</Text>
                    )}
                </View>
            ) : (
                <View style={styles.activeBooking}>
                    <MaterialIcons name="electric-bolt" size={16} color="#007AFF" />
                    <Text style={styles.activeText}>Currently Charging</Text>
                </View>
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
            <Text style={styles.title}>My Charger Location Bookings</Text>
            {bookings.length === 0 ? (
                <View style={styles.centered}>
                    <MaterialIcons name="ev-station" size={50} color="#ccc" />
                    <Text style={styles.emptyText}>No bookings found</Text>
                    <Text style={styles.emptySubtext}>Your charging locations haven't been booked yet</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.booking_id?.toString() || Math.random().toString()}
                    refreshing={loading}
                    onRefresh={fetchLocationBookings}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    bookingCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    bookingTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    activeBooking: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        padding: 8,
        backgroundColor: '#e3f2fd',
        borderRadius: 4,
    },
    activeText: {
        color: '#007AFF',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    completedBooking: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        padding: 8,
        backgroundColor: '#e8f5e8',
        borderRadius: 4,
    },
    completedText: {
        color: '#28a745',
        fontWeight: 'bold',
        marginLeft: 4,
    },
    reviewContainer: {
        marginTop: 8,
        padding: 8,
        backgroundColor: '#fff3cd',
        borderRadius: 4,
    },
    starsContainer: {
        flexDirection: 'row',
        marginTop: 4,
    },
    reviewMessage: {
        fontStyle: 'italic',
        color: '#666',
        marginTop: 4,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        fontWeight: 'bold',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});
