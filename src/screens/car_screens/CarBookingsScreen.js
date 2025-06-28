import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import env from "../../config/environment";

export default function CarBookingsScreen({ navigation, route }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const { car, user } = route.params || {}; // Add default empty object

    // Add safety check
    if (!car) {
        return (
            <View style={styles.centered}>
                <Text>No car selected</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: '#007AFF' }}>Go Back</Text>
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
                },
                body: JSON.stringify({
                    car_id: car.car_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(data || []);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderBooking = ({ item }) => (
        <View style={styles.bookingItem}>
            <Text style={styles.locationText}>{item.location_name}</Text>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.statusText}>{item.status}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>All existing bookings for {car.model}</Text>
            <Text style={styles.subtitle}>{car.license_plate}</Text>

            {loading ? (
                <View style={styles.centered}>
                    <Text>Loading bookings...</Text>
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.id?.toString()}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <TouchableOpacity
                style={styles.addBookingButton}
                onPress={() => navigation.navigate('ChargerLocations', { car, user })}
            >
                <MaterialIcons name="add" size={24} color="white" />
                <Text style={styles.addBookingText}>Add Booking</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    bookingItem: {
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    locationText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    statusText: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 5,
    },
    addBookingButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    addBookingText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
