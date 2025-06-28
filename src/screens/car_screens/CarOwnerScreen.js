// src/screens/CarOwnerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import env from '../../config/environment';

export default function CarOwnerScreen({ navigation, user }) {
    const [cars, setCars] = useState([]);

    useEffect(() => {
        fetchUserCars();
    }, []);



    const fetchUserCars = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-car`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`
                },
                body: JSON.stringify({ user_id: user.user_id })
            });

            const data = await response.json();
            if (response.ok) {
                setCars(data);
            }
        } catch (error) {
            console.error('Fetch cars error:', error);
        }
    };

    const renderCarItem = ({ item }) => (
        <View style={styles.carCard}>
            <View style={styles.carInfo}>
                <Text style={styles.carTitle}>{item.model} ({item.year})</Text>
                <Text style={styles.carSubtitle}>Color: {item.color}</Text>
                <Text style={styles.carSubtitle}>License: {item.license_plate}</Text>
            </View>
            <TouchableOpacity
                style={styles.bookingsButton}
                onPress={() => navigation.navigate('CarBookings', { car: item, user })}
            >
                <Icon name="event" size={24} color="#007AFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => navigation.navigate('MyBookingsScreen', { user })}
                >
                    <Icon name="calendar-today" size={32} color="#007AFF" />
                    <Text>My Bookings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={() => {
                        if (user) {
                            // Use setTimeout to ensure navigation stack is ready
                            setTimeout(() => {
                                onCarAdded: fetchCars // Pass your fetchCars function
                            }, 0);
                        }
                    }}
                >
                    <Icon name="directions-car" size={32} color="#007AFF" />
                    <Text>Add Car</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.title}>My Cars</Text>
            <FlatList
                data={cars}
                renderItem={renderCarItem}
                keyExtractor={item => item.car_id.toString()}
                ListEmptyComponent={<Text style={styles.empty}>No cars found</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    headerButton: {
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    carCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    carInfo: {
        flex: 1,
    },
    carTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    carSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    bookingsButton: {
        justifyContent: 'center',
        padding: 8,
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
});
