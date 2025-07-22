import React, { useState, useEffect, useRef } from 'react';
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
import MapView, { Marker } from 'react-native-maps';
import { Dimensions } from 'react-native';
import env from '../../config/environment';

export default function ChargerLocationListScreenWithoutCar({ navigation, route }) {
    const { user, searchResults, searchCriteria } = route.params;
    const [chargingLocations, setChargingLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLocationId, setSelectedLocationId] = useState(null);
    const [mapLoading, setMapLoading] = useState(false);
    const mapRef = useRef(null);

    const getInitialRegion = () => {
        if (chargingLocations.length > 0) {
            const firstLocation = chargingLocations.find(loc =>
                loc.latitude && loc.longitude &&
                !isNaN(loc.latitude) && !isNaN(loc.longitude)
            );

            if (firstLocation) {
                return {
                    latitude: parseFloat(firstLocation.latitude),
                    longitude: parseFloat(firstLocation.longitude),
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
            }
        }

        // If we have search criteria with city, try to get coordinates for that city
        if (searchCriteria?.city) {
            // You'll need to implement city-to-coordinates mapping
            const cityCoordinates = getCityCoordinates(searchCriteria.city);
            if (cityCoordinates) {
                return {
                    latitude: cityCoordinates.latitude,
                    longitude: cityCoordinates.longitude,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                };
            }
        }

        // Default fallback
        return {
            latitude: 51.5074,
            longitude: -0.1278,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
        };
    };

// Add this helper function to map cities to coordinates
    const getCityCoordinates = (cityName) => {
        const cityCoordinates = {
            // UK Cities
            'london': { latitude: 51.5074, longitude: -0.1278 },
            'manchester': { latitude: 53.4808, longitude: -2.2426 },
            'birmingham': { latitude: 52.4862, longitude: -1.8904 },
            'leeds': { latitude: 53.8008, longitude: -1.5491 },
            'glasgow': { latitude: 55.8642, longitude: -4.2518 },
            'sheffield': { latitude: 53.3811, longitude: -1.4701 },
            'bradford': { latitude: 53.7960, longitude: -1.7594 },
            'edinburgh': { latitude: 55.9533, longitude: -3.1883 },
            'liverpool': { latitude: 53.4084, longitude: -2.9916 },
            'bristol': { latitude: 51.4545, longitude: -2.5879 },

            // Iranian Cities
            'tehran': { latitude: 35.6892, longitude: 51.3890 },
            'mashhad': { latitude: 36.2605, longitude: 59.6168 },
            'isfahan': { latitude: 32.6546, longitude: 51.6680 },
            'esfahan': { latitude: 32.6546, longitude: 51.6680 },
            'karaj': { latitude: 35.8327, longitude: 50.9916 },
            'shiraz': { latitude: 29.5918, longitude: 52.5837 },
            'tabriz': { latitude: 38.0667, longitude: 46.3000 },
            'qom': { latitude: 34.6401, longitude: 50.8764 },
            'ahvaz': { latitude: 31.3183, longitude: 48.6706 },
            'kermanshah': { latitude: 34.3277, longitude: 47.0778 },
            'urmia': { latitude: 37.5527, longitude: 45.0761 },
            'rasht': { latitude: 37.2808, longitude: 49.5832 },
            'zahedan': { latitude: 29.4963, longitude: 60.8629 },
            'kerman': { latitude: 30.2839, longitude: 57.0834 },
            'arak': { latitude: 34.0954, longitude: 49.7013 },
            'yazd': { latitude: 31.8974, longitude: 54.3569 },
            'ardabil': { latitude: 38.2498, longitude: 48.2933 },
            'bandar abbas': { latitude: 27.1865, longitude: 56.2808 },
            'esfahak': { latitude: 32.6546, longitude: 51.6680 }, // Alternative spelling
            'hamedan': { latitude: 34.7992, longitude: 48.5146 },
            'sanandaj': { latitude: 35.3111, longitude: 46.9988 },
            'qazvin': { latitude: 36.2688, longitude: 50.0041 },
            'zanjan': { latitude: 36.6736, longitude: 48.4787 },
            'khorramabad': { latitude: 33.4878, shiites: 48.3553 },
            'gorgan': { latitude: 36.8427, longitude: 54.4394 },
            'sari': { latitude: 36.5633, longitude: 53.0601 },
            'dezful': { latitude: 32.3836, longitude: 48.4011 },
            'bushehr': { latitude: 28.9684, longitude: 50.8385 },
            'kish': { latitude: 26.5581, longitude: 53.9805 },
            'abadan': { latitude: 30.3392, longitude: 48.3043 },
            'ilam': { latitude: 33.6374, longitude: 46.4227 },
            'birjand': { latitude: 32.8663, longitude: 59.2211 },
            'semnan': { latitude: 35.5769, longitude: 53.3920 },
            'bojnurd': { latitude: 37.4747, longitude: 57.3281 },
            'shahrekord': { latitude: 32.3256, longitude: 50.8644 },
            'yasuj': { latitude: 30.6682, longitude: 51.5881 },
            'kashan': { latitude: 33.9831, longitude: 51.4364 },
            'najafabad': { latitude: 32.6342, longitude: 51.3667 },
            'khoy': { latitude: 38.5503, longitude: 44.9228 },
            'malayer': { latitude: 34.2969, longitude: 48.8235 },
            'sabzevar': { latitude: 36.2126, longitude: 57.6810 },
            'shahrood': { latitude: 36.4181, longitude: 54.9756 },
            'maragheh': { latitude: 37.3981, longitude: 46.2381 },
            'varamin': { latitude: 35.3242, longitude: 51.6458 },
            'quchan': { latitude: 37.1056, longitude: 58.5097 },
            'saveh': { latitude: 35.0213, longitude: 50.3566 },
            'mahabad': { latitude: 36.7630, longitude: 45.7222 },
            'bam': { latitude: 29.1059, longitude: 58.3570 },
            'iranshahr': { latitude: 27.2025, longitude: 60.6848 },
            'mianeh': { latitude: 37.4253, longitude: 47.7108 },
            'doroud': { latitude: 33.4896, longitude: 49.0551 },
            'torbat heydariyeh': { latitude: 35.2741, longitude: 59.2196 },
            'neyshabur': { latitude: 36.2138, longitude: 58.7958 },
            'shush': { latitude: 32.1947, longitude: 48.2433 },
            'minab': { latitude: 27.1469, longitude: 57.0800 },
            'gachsaran': { latitude: 30.3581, longitude: 50.7969 },
            'rafsanjan': { latitude: 30.4067, longitude: 55.9939 }
        };

        const normalizedCity = cityName.toLowerCase().trim();
        console.log(normalizedCity);
        return cityCoordinates[normalizedCity] || null;
    };

    const [mapRegion, setMapRegion] = useState(getInitialRegion());

    useEffect(() => {
        if (searchResults) {
            setChargingLocations(searchResults);
            setLoading(false);

            if (searchResults.length === 0 && searchCriteria?.city) {
                const cityRegion = {
                    latitude: 51.5074,
                    longitude: -0.1278,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                };
                setMapRegion(cityRegion);
                if (mapRef.current) {
                    mapRef.current.animateToRegion(cityRegion, 1000);
                }
            }
        } else {
            fetchChargingLocations();
        }
    }, []);

    const fetchChargingLocations = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/charging-locations`);
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

    const findNearbyLocations = async (latitude, longitude) => {
        setMapLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/find-nearby-charging-locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    "Authorization": `Bearer ${env.apiToken}`
                },
                body: JSON.stringify({
                    latitude: latitude,
                    longitude: longitude,
                }),
            });

            if (response.ok) {
                const nearbyLocations = await response.json();
                setChargingLocations(nearbyLocations);
                console.log('Found nearby locations:', nearbyLocations.length);
            } else {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
            }
        } catch (error) {
            console.error('Find nearby locations error:', error);
        } finally {
            setMapLoading(false);
        }
    };

    const handleMapRegionChangeComplete = (region) => {
        const threshold = 0.01;
        const latDiff = Math.abs(region.latitude - mapRegion.latitude);
        const lngDiff = Math.abs(region.longitude - mapRegion.longitude);

        if (latDiff > threshold || lngDiff > threshold) {
            setMapRegion(region);
            findNearbyLocations(region.latitude, region.longitude);
        }
    };

    const handleLocationSelect = (location) => {
        navigation.navigate('CarSelectionScreen', {
            user,
            chargingLocation: location
        });
    };

    const handleMarkerPress = (location) => {
        if (!location.latitude || !location.longitude) return;

        setSelectedLocationId(location.charging_location_id);

        const selectedRegion = {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };

        if (mapRef.current) {
            mapRef.current.animateToRegion(selectedRegion, 1000);
        }
    };

    const renderProceedButton = () => {
        if (!selectedLocationId) return null;

        const selectedLocation = chargingLocations.find(
            location => location.charging_location_id === selectedLocationId
        );

        if (!selectedLocation || !selectedLocation.is_available) return null;

        return (
            <TouchableOpacity
                style={styles.proceedButton}
                onPress={() => handleLocationSelect(selectedLocation)}
            >
                <Text style={styles.proceedButtonText}>
                    Select: {selectedLocation.street_address}
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
        );
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
        const isSelected = selectedLocationId === location.charging_location_id;

        return (
            <TouchableOpacity
                key={location.charging_location_id}
                style={[
                    styles.locationCard,
                    !isAvailable && styles.unavailableCard,
                    isSelected && styles.selectedCard
                ]}
                onPress={() => isAvailable ? handleLocationSelect(location) : null}
                activeOpacity={isAvailable ? 0.8 : 1}
                disabled={!isAvailable}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.locationInfo}>
                        <Text style={styles.locationTitle}>
                            {location.name}
                        </Text>
                        <Text style={styles.locationAddress}>
                            {location.city}, {location.street}, {location.alley}
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
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={mapRegion}
                    onRegionChangeComplete={handleMapRegionChangeComplete}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                    zoomControlEnabled={true}
                    showsCompass={true}
                    showsScale={true}
                >
                    {chargingLocations
                        .filter(location =>
                            location.latitude &&
                            location.longitude &&
                            !isNaN(location.latitude) &&
                            !isNaN(location.longitude)
                        )
                        .map(location => (
                            <Marker
                                key={location.charging_location_id}
                                coordinate={{
                                    latitude: parseFloat(location.latitude),
                                    longitude: parseFloat(location.longitude),
                                }}
                                pinColor={
                                    selectedLocationId === location.charging_location_id
                                        ? '#FF6B35'
                                        : location.is_available
                                            ? '#4CAF50'
                                            : '#f44336'
                                }
                                onPress={() => handleMarkerPress(location)}
                            >
                                <View style={[
                                    styles.customMarker,
                                    { backgroundColor: selectedLocationId === location.charging_location_id ? '#FF6B35' : '#4CAF50' }
                                ]}>
                                    <MaterialIcons
                                        name="ev-station"
                                        size={20}
                                        color="#fff"
                                    />
                                </View>
                            </Marker>
                        ))
                    }
                </MapView>

                {mapLoading && (
                    <View style={styles.mapLoadingOverlay}>
                        <ActivityIndicator size="small" color="#4CAF50" />
                        <Text style={styles.mapLoadingText}>Finding nearby locations...</Text>
                    </View>
                )}
                {renderProceedButton()}
            </View>

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
                                Try zooming or moving the map to find nearby locations
                            </Text>
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
    mapContainer: {
        position: 'relative',
    },
    map: {
        width: Dimensions.get('window').width,
        height: 250,
    },
    customMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    mapLoadingOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapLoadingText: {
        marginLeft: 8,
        fontSize: 12,
        color: '#333',
    },
    proceedButton: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    proceedButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
    },
    selectedCard: {
        borderColor: '#FF6B35',
        borderWidth: 2,
        backgroundColor: '#fff8f5',
    },
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
});
