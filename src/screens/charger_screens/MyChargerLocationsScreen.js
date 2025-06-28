import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';

export default function MyChargerLocationsScreen({ navigation, route }) {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = route.params?.user;

    useEffect(() => {
        if (user) {
            console.log('Fetching charger locations for user:', user.user_id);
            fetchChargerLocations();
        }
    }, [user]);

    const fetchChargerLocations = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-charger-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);
                setLocations(data || []);
            } else {
                Alert.alert('Error', 'Failed to fetch charger locations');
            }
        } catch (error) {
            console.error('Network error:', error);
            Alert.alert('Error', 'Network error for this request');
        } finally {
            setLoading(false);
        }
    };

    const renderLocation = ({ item }) => (
        <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
                <View style={styles.locationInfo}>
                    <Text style={styles.locationTitle}>{item.name || `Location ${item.id}`}</Text>
                    <Text style={styles.locationAddress}>{item.address}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: item.is_available ? '#34A853' : '#EA4335' }]} />
                    <Text style={styles.statusText}>{item.is_available ? 'Available' : 'Occupied'}</Text>
                </View>
            </View>

            <View style={styles.locationDetails}>
                <View style={styles.detailItem}>
                    <MaterialIcons name="electric-bolt" size={16} color="#4285F4" />
                    <Text style={styles.detailText}>Power: {item.power_output || 'N/A'} kW</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialIcons name="attach-money" size={16} color="#34A853" />
                    <Text style={styles.detailText}>€{item.price_per_hour || 0}/hour</Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <MaterialIcons name="ev-station" size={50} color="#ccc" />
                <Text style={styles.loadingText}>Loading your charger locations...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Charger Locations</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddChargerLocation', {
                        user,
                        onLocationAdded: fetchChargerLocations
                    })}
                >
                    <LinearGradient
                        colors={['#4285F4', '#34A853']}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="add" size={24} color="#fff" />
                        <Text style={styles.addButtonText}>Add Location</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {locations.length === 0 ? (
                <View style={styles.centered}>
                    <MaterialIcons name="ev-station" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>No charger locations yet</Text>
                    <Text style={styles.emptySubtext}>Add your first charging station to start earning</Text>
                    <TouchableOpacity
                        style={styles.getStartedButton}
                        onPress={() => navigation.navigate('AddChargerLocation', {
                            user,
                            onLocationAdded: fetchChargerLocations
                        })}
                    >
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={locations}
                    renderItem={renderLocation}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    refreshing={loading}
                    onRefresh={fetchChargerLocations}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
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
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    addButton: {
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
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    locationCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    locationInfo: {
        flex: 1,
    },
    locationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    locationAddress: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    locationDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 4,
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
    },
    getStartedButton: {
        backgroundColor: '#4285F4',
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
