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
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";
import MapScreen from '../../components/MapScreen';
import env from "../../config/env";

import Icon from 'react-native-vector-icons/FontAwesome';

export default function ChargerLocationListScreenWithoutCar({ navigation, route }) {
    const { t } = useTranslation();

    const { user, searchResults, searchCriteria } = route.params;
    const [chargingLocations, setChargingLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- New State ---
    const [mapRegion, setMapRegion] = useState(null);
    const [mapMarkers, setMapMarkers] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [isMapInteracting, setIsMapInteracting] = useState(false);

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
                Alert.alert(t('messages.error'), data.message || t('messages.failFetchCharger'));
            }
        } catch (error) {
            console.error(t('messages.fetchLocError'), error);
            Alert.alert(t('messages.error'), t('messages.tryAgain'));
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

    // --- Helper: Get fallback region from searchCriteria ---
    const getFallbackRegion = () => {
        const cityCoords = {
            'tehran': { latitude: 35.6892, longitude: 51.3890 },
            'isfahan': { latitude: 32.6546, longitude: 51.6680 },
            'shiraz': { latitude: 29.5918, longitude: 52.5837 },
            'mashhad': { latitude: 36.2974, longitude: 59.6067 },
            'tabriz': { latitude: 38.0962, longitude: 46.2738 }
        };
        const cityKey = searchCriteria?.city?.toLowerCase();
        return cityCoords[cityKey] || { latitude: 35.6892, longitude: 51.3890 };
    };

    // --- Initial Map Setup ---
    useEffect(() => {
        if (searchResults && searchResults.length > 0) {
            // Calculate bounding box for all markers
            const lats = searchResults.map(loc => loc.latitude);
            const lngs = searchResults.map(loc => loc.longitude);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            // Center point
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;
            // Delta for zoom
            const latDelta = Math.max(0.05, (maxLat - minLat) * 1.5);
            const lngDelta = Math.max(0.05, (maxLng - minLng) * 1.5);
            setMapMarkers(searchResults.map(loc => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
                title: loc.name,
                description: `${loc.city}, ${loc.country}`,
                id: loc.charging_location_id
            })));
            setMapRegion({
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta: latDelta,
                longitudeDelta: lngDelta,
            });
        } else {
            const fallback = getFallbackRegion();
            setMapRegion({
                latitude: fallback.latitude,
                longitude: fallback.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
            setMapMarkers([]);
        }
    }, [searchResults, searchCriteria]);

    // --- Map Interactivity: Find Nearby Locations ---
    const handleRegionChangeComplete = async (region) => {
        if (isMapInteracting) return;
        setIsMapInteracting(true);
        try {
            const response = await fetch(`${env.apiUrl}/find-nearby-locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Token': `${env.apiToken} `,
                },
                body: JSON.stringify({ latitude: region.latitude, longitude: region.longitude })
            });
            const data = await response.json();
            if (response.ok && Array.isArray(data)) {
                setMapMarkers(data.map(loc => ({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    title: loc.name,
                    description: `${loc.city}, ${loc.country}`,
                    id: loc.charging_location_id
                })));
            }
        } catch (error) {
            // Optionally show error
        } finally {
            setIsMapInteracting(false);
        }
    };

    // --- Marker Selection ---
    const handleMarkerPress = (marker) => {
        setSelectedLocation({
            latitude: marker.latitude,
            longitude: marker.longitude,
            title: location.name,
            description: `${location.city}, ${location.street}`,
            id: location.charging_location_id
        });
    };

    // --- Proceed Button ---
    const handleProceed = () => {
        if (selectedLocation) {
            navigation.navigate('CarSelectionScreen', {
                user,
                chargingLocation: selectedLocation
            });
        }
    };

    const renderSearchCriteria = () => {
        if (!searchCriteria) return null;

        return (
            <View style={styles.searchCriteriaContainer}>
                <FarsiText style={styles.searchCriteriaTitle}>{t('messages.searchResult')}</FarsiText>
                <View style={styles.criteriaRow}>
                    {searchCriteria.city && (
                        <Text style={styles.criteriaItem}>📍 {searchCriteria.city}</Text>
                    )}
                    {searchCriteria.street && (
                        <Text style={styles.criteriaItem}>🛣️ {searchCriteria.street}</Text>
                    )}
                    {searchCriteria.fast_charging && (
                        <FarsiText style={styles.criteriaItem}>⚡ {t('messages.fastCharging')}</FarsiText>
                    )}
                </View>
            </View>
        );
    };

    const renderLocationCard = (location) => {
        const isAvailable = location.is_available === true;
        const pricePerHour = location.price_per_hour || 'N/A';
        const reviewAverage = location.review_average;
        const reviewNumber = location.review_number;
        const filledStars = Math.floor(reviewAverage);
        const hasHalfStar = reviewAverage - filledStars >= 0.5;

        const isSelected = selectedLocation && selectedLocation.id === location.charging_location_id;
        return (
            <TouchableOpacity
                key={location.charging_location_id}
                style={[styles.locationCard, !isAvailable && styles.unavailableCard, isSelected && styles.selectedCard]}
                onPress={() => {
                    if (isAvailable) {
                        setSelectedLocation({
                            latitude: location.latitude,
                            longitude: location.longitude,
                            title: location.name,
                            description: `${location.city}, ${location.street}`,
                            id: location.charging_location_id
                        });
                    }
                }}
                activeOpacity={isAvailable ? 0.8 : 1}
                disabled={!isAvailable}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.locationInfo}>
                        <FarsiText style={styles.locationTitle}>
                            {location.street_address || t('messages.chargingStation')}
                        </FarsiText>
                        <FarsiText style={styles.locationAddress}>
                            {location.city}, {location.street || t('messages.unknown')}
                        </FarsiText>
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
                        <FarsiText style={styles.statusText}>
                            {isAvailable ? t('messages.avail') : t('messages.occupied')}
                        </FarsiText>
                    </View>
                </View>

                <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                        <MaterialIcons name="flash-on" size={20} color="#FF6B35" />
                        <FarsiText style={styles.detailText}>
                            {location.fast_charging ? t('messages.fastCharging') : t('messages.standardCharge')}
                        </FarsiText>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialIcons name="attach-money" size={20} color="#4CAF50" />
                        <Text style={styles.detailText}>
                              {pricePerHour}/hour
                        </Text>
                    </View>


                     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ marginRight: 4, fontSize: 16 }}>{reviewAverage}</Text>

                        {[...Array(5)].map((_, i) => (
                            <Icon
                            key={i}
                            name={
                                i < filledStars
                                ? 'star'
                                : i === filledStars && hasHalfStar
                                ? 'star-half-full'
                                : 'star-o'
                            }
                            size={20}
                            color= {'#FFD700'}  />
                       ))}

                         <Text style={{ marginLeft: 4, fontSize: 16 }}>({reviewNumber})</Text>
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
                        <FarsiText style={styles.selectText}>{t('messages.selectLoc')}</FarsiText>
                        <MaterialIcons name="arrow-forward" size={20} color="#4CAF50" />
                    </View>
                )}

                {!isAvailable && (
                    <View style={styles.cardFooter}>
                        <FarsiText style={styles.unavailableText}>{t('messages.unavailable')}</FarsiText>
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
                <FarsiText style={styles.loadingText}>{t('messages.loadingLocation')}</FarsiText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* MapScreen above the list */}
            <View style={{ height: 300 }}>
                <MapScreen
                    region={mapRegion}
                    markers={mapMarkers.map(m => ({ ...m, selected: selectedLocation?.id === m.id }))}
                    onRegionChangeComplete={handleRegionChangeComplete}
                    onLocationSelected={handleMarkerPress}
                />
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
                    <FarsiText style={styles.headerTitle}>{t('messages.availableChargingStation')}</FarsiText>
                    <FarsiText style={styles.headerSubtitle}>
                        {chargingLocations.length} {t('messages.loc')}{chargingLocations.length !== 1 ? t('messages.s') : ''} {t('messages.found')}
                    </FarsiText>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderSearchCriteria()}

                <View style={styles.locationsContainer}>
                    {chargingLocations.length === 0 ? (
                        <View style={styles.noResultsContainer}>
                            <MaterialIcons name="search-off" size={80} color="#ccc" />
                            <FarsiText style={styles.noResultsText}>{t('messages.noChargingLoc')}</FarsiText>
                            <FarsiText style={styles.noResultsSubtext}>
                                {t('messages.tryAdjust')}
                            </FarsiText>
                            <TouchableOpacity
                                style={styles.searchAgainButton}
                                onPress={() => navigation.goBack()}
                            >
                                <FarsiText style={styles.searchAgainButtonText}>{t('messages.searchAgain')}</FarsiText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        chargingLocations.map(renderLocationCard)
                    )}
                </View>

                {/* Proceed Button */}
                {selectedLocation && (
                    <TouchableOpacity style={{margin: 16, padding: 16, backgroundColor: '#4CAF50', borderRadius: 8}} onPress={handleProceed}>
                        <FarsiText style={{color: '#fff', fontWeight: 'bold', textAlign: 'center'}}>{t('messages.proceedWithSelectedLocation')}</FarsiText>
                    </TouchableOpacity>
                )}
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
    selectedCard: {
        borderColor: '#4CAF50',
        borderWidth: 2,
        backgroundColor: '#e8f5e9',
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
