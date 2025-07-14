import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';

export default function MyChargerLocationsScreen({ navigation, route }) {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const user = route.params?.user;

    useEffect(() => {
        if (user) {
            console.log('Fetching charger locations for user:', user.user_id);
            fetchChargerLocations();
        }
    }, [user]);

    const fetchChargerLocations = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-charging-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,
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
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchChargerLocations();
    };

    const renderLocation = ({ item }) => (
        <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
                <View style={styles.locationIconContainer}>
                    <MaterialIcons name="ev-station" size={24} color="#667eea" />
                </View>
                <View style={styles.locationInfo}>
                    <Text style={styles.locationTitle}>{item.name || `Location ${item.id}`}</Text>
                    <Text style={styles.locationAddress}>{item.address}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: item.is_available ? '#4CAF50' : '#ff6b6b' }]}>
                    <MaterialIcons
                        name={item.is_available ? "check-circle" : "cancel"}
                        size={16}
                        color="#fff"
                    />
                    <Text style={styles.statusText}>{item.is_available ? 'Available' : 'Occupied'}</Text>
                </View>
            </View>

            <View style={styles.locationDetails}>
                <View style={styles.detailRow}>
                    <MaterialIcons name="electric-bolt" size={18} color="#667eea" />
                    <Text style={styles.detailLabel}>Power Output:</Text>
                    <Text style={styles.detailValue}>{item.power_output || 'N/A'} kW</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={18} color="#667eea" />
                    <Text style={styles.detailLabel}>Rate:</Text>
                    <Text style={styles.detailValue}>€{item.price_per_hour || 0}/hour</Text>
                </View>
                <View style={styles.detailRow}>
                    <MaterialIcons name="speed" size={18} color="#667eea" />
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>
                        {item.fast_charging ? 'Fast Charging' : 'Standard Charging'}
                    </Text>
                </View>
            </View>

            <View style={styles.locationActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <MaterialIcons name="edit" size={18} color="#667eea" />
                    <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('LocationBookings', {
                        location: item,
                        user
                    })}
                >
                    <MaterialIcons name="history" size={18} color="#667eea" />
                    <Text style={styles.actionText}>Bookings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <MaterialIcons name="ev-station" size={64} color="#ccc" />
                <Text style={styles.loadingText}>Loading your charger locations...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons name="ev-station" size={60} color="#fff" />
                </View>
                <Text style={styles.title}>My Charging Stations</Text>
                <Text style={styles.subtitle}>
                    Manage your charging locations and track performance
                </Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddChargerLocation', {
                        user,
                        onLocationAdded: fetchChargerLocations
                    })}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#43e97b', '#38f9d7']}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Add Location</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </LinearGradient>

            {locations.length === 0 ? (
                <ScrollView
                    contentContainerStyle={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <MaterialIcons name="ev-station" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>No charging stations yet</Text>
                    <Text style={styles.emptySubtext}>
                        Add your first charging station to start earning money from EV drivers
                    </Text>
                    <TouchableOpacity
                        style={styles.getStartedButton}
                        onPress={() => navigation.navigate('AddChargerLocation', {
                            user,
                            onLocationAdded: fetchChargerLocations
                        })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#667eea', '#764ba2']}
                            style={styles.getStartedGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <MaterialIcons name="add-business" size={20} color="#fff" />
                            <Text style={styles.getStartedText}>Get Started</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <FlatList
                    data={locations}
                    renderItem={renderLocation}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
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
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
        marginBottom: 20,
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
    },
    locationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    locationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
    locationDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        minWidth: 100,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        flex: 1,
    },
    locationActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f0f4ff',
        flex: 0.48,
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 14,
        color: '#667eea',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    getStartedGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    getStartedText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});
