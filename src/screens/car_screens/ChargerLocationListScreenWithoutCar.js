import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ChargerLocationListScreenWithoutCar({ navigation, route }) {
    const { user, searchResults, searchCriteria } = route.params;
    const [chargingLocations, setChargingLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (searchResults) {
            setChargingLocations(searchResults);
            setLoading(false);
        } else {
            // If no search results, fetch all locations
            fetchChargingLocations();
        }
    }, []);

    const fetchChargingLocations = async () => {
        try {
            const response = await fetch('http://192.168.1.100:3000/charging-locations');
            const data = await response.json();

            if (response.ok) {
                setChargingLocations(data);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch charging locations');
            }
        } catch (error) {
            console.error('Fetch locations error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (location) => {
        // Navigate to CarSelectionScreen with the selected charging location
        navigation.navigate('CarSelectionScreen', {
            user,
            chargingLocation: location
        });
    };

    const renderSearchCriteria = () => {
        if (!searchCriteria) return null;

        return (
            <View style={styles.searchCriteriaContainer}>
                <Text style={styles.searchCriteriaTitle}>Search Results for:</Text>
                <View style={styles.criteriaRow}>
                    {searchCriteria.city && (
                        <Text style={styles.criteriaItem}>📍 {searchCriteria.city}</Text>
                    )}
                    {searchCriteria.street && (
                        <Text style={styles.criteriaItem}>🛣️ {searchCriteria.street}</Text>
                    )}
                    {searchCriteria.fast_charging && (
                        <Text style={styles.criteriaItem}>⚡ Fast Charging</Text>
                    )}
                </View>
            </View>
        );
    };

    const renderLocationCard = (location) => {
        const isAvailable = location.is_available === true;
        const pricePerHour = location.price_per_hour || 'N/A';

        return (
            <TouchableOpacity
                key={location.charging_location_id}
                style={[
                    styles.locationCard,
                    !isAvailable && styles.unavailableCard
                ]}
                onPress={() => isAvailable ? handleLocationSelect(location) : null}
                activeOpacity={isAvailable ? 0.8 : 1}
                disabled={!isAvailable}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle}>
                            {location.street_address || 'Charging Station'}
                        </Text>
                        <Text style={styles.locationAddress}>
                            {location.city}, {location.state || 'Unknown State'}
                        </Text>
                        {location.postcode && (
                            <Text style={styles.locationPostcode}>
                                Postcode: {location.postcode}
                            </Text>
                        )}
                    </View>
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: isAvailable ? '#4CAF50' : '#f44336' }
                    ]}>
                        <Text style={styles.statusText}>
                            {isAvailable ? 'Available' : 'Occupied'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <MaterialIcons name="flash-on" size={20} color="#FF6B35" />
                        <Text style={styles.detailText}>
                            {location.fast_charging ? 'Fast Charging' : 'Standard Charging'}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialIcons name="attach-money" size={20} color="#4CAF50" />
                        <Text style={styles.detailText}>
                            £{pricePerHour}/hour
                        </Text>
                    </View>

                    {location.phone_number && (
                        <View style={styles.detailRow}>
                            <MaterialIcons name="phone" size={20} color="#2196F3" />
                            <Text style={styles.detailText}>
                                {location.phone_number}
                            </Text>
                        </View>
                    )}

                    {location.description && (
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.descriptionText}>
                                {location.description}
                            </Text>
                        </View>
                    )}
                </View>

                {isAvailable && (
                    <View style={styles.cardFooter}>
                        <Text style={styles.selectText}>Tap to select this location</Text>
                        <MaterialIcons name="arrow-forward" size={20} color="#4CAF50" />
                    </View>
                )}

                {!isAvailable && (
                    <View style={styles.cardFooter}>
                        <Text style={styles.unavailableText}>Currently unavailable</Text>
                        <MaterialIcons name="block" size={20} color="#f44336" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading charging locations...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <MaterialIcons name="ev-station" size={40} color="#fff" />
                    <Text style={styles.headerTitle}>Available Charging Stations</Text>
                    <Text style={styles.headerSubtitle}>
                        {chargingLocations.length} location{chargingLocations.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderSearchCriteria()}

                <View style={styles.locationsContainer}>
                    {chargingLocations.length === 0 ? (
                        <View style={styles.noResultsContainer}>
                            <MaterialIcons name="search-off" size={80} color="#ccc" />
                            <Text style={styles.noResultsText}>No charging locations found</Text>
                            <Text style={styles.noResultsSubtext}>
                                Try adjusting your search criteria
                            </Text>
                            <TouchableOpacity
                                style={styles.searchAgainButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.searchAgainButtonText}>Search Again</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        chargingLocations.map(renderLocationCard)
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1,
        padding: 8,
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    searchCriteriaContainer: {
        backgroundColor: '#fff',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    searchCriteriaTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    criteriaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    criteriaItem: {
        fontSize: 14,
        color: '#666',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    locationsContainer: {
        padding: 16,
        paddingTop: 0,
    },
    locationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    unavailableCard: {
        backgroundColor: '#f8f8f8',
        opacity: 0.7,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    locationInfo: {
        flex: 1,
        marginRight: 12,
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
        marginBottom: 2,
    },
    locationPostcode: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardDetails: {
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
        flex: 1,
    },
    descriptionContainer: {
        marginTop: 8,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    selectText: {
        fontSize: 14,
        color: '#4CAF50',
        fontWeight: '600',
    },
    unavailableText: {
        fontSize: 14,
        color: '#f44336',
        fontWeight: '600',
    },
    noResultsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noResultsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    noResultsSubtext: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    searchAgainButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    searchAgainButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
