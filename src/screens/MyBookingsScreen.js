import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function MyBookingsScreen({ navigation, route }) {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = route.params?.user;

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const response = await fetch('YOUR_API_URL/find-car', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user?.id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setCars(data.cars || []);
            }
        } catch (error) {
            console.error('Error fetching cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewBookings = (car) => {
        navigation.navigate('CarBookings', { car, user });
    };

    const renderCar = ({ item }) => (
        <View style={styles.carItem}>
            <View style={styles.carInfo}>
                <Text style={styles.carModel}>{item.model}</Text>
                <Text style={styles.carDetails}>{item.color} • {item.year} • {item.license_plate}</Text>
            </View>
            <TouchableOpacity
                style={styles.bookingsButton}
                onPress={() => handleViewBookings(item)}
            >
                <MaterialIcons name="event" size={24} color="#007AFF" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text>Loading cars...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Cars</Text>

            <FlatList
                data={cars}
                renderItem={renderCar}
                keyExtractor={(item) => item.id?.toString()}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddCar', { user })}
            >
                <MaterialIcons name="add" size={24} color="white" />
                <Text style={styles.addButtonText}>Add Car</Text>
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
        marginBottom: 20,
    },
    carItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 2,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    carInfo: {
        flex: 1,
    },
    carModel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    carDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    bookingsButton: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    addButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    addButtonText: {
        color: 'white',
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
