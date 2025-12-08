import React, { useState, useEffect, useRef } from 'react';
import showAlert from '../utils/alert';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Alert
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import chargingLocationService from '../services/chargingLocationService';
import FarsiText from './FarsiText';
import { useTranslation } from 'react-i18next';

const ChargingLocationMap = ({
    initialLocation,
    onLocationSelect,
    showPublicChargers = true,
    showUserLocations = true,
    searchRadius = 10,
    style,
    focusArea = null, // { city, country, coordinates }
    enableLocationSelection = false,
    showAccommodationOnly = false, // NEW FILTER
    onLocationsUpdate, // NEW callback({public,user,total,region})
    selectedLocationId, // external highlight
    focusLocation // {latitude,longitude} to animate to
}) => {
    const { t } = useTranslation();
    const mapRef = useRef(null);

    const [publicChargers, setPublicChargers] = useState([]);
    const [userLocations, setUserLocations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showPublic, setShowPublic] = useState(showPublicChargers);
    const [showUser, setShowUser] = useState(showUserLocations);
    const [mapRegion, setMapRegion] = useState({
        latitude: initialLocation?.latitude || 52.370216,
        longitude: initialLocation?.longitude || 4.895168,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    useEffect(() => {
        if (focusArea?.coordinates) {
            // Focus map on specified area from form
            const newRegion = {
                latitude: focusArea.coordinates.latitude,
                longitude: focusArea.coordinates.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            };
            setMapRegion(newRegion);

            if (mapRef.current) {
                mapRef.current.animateToRegion(newRegion, 1000);
            }
        }
    }, [focusArea]);

    useEffect(() => {
        loadChargingLocations();
    }, [mapRegion, showPublic, showUser]);

    // Sync controlled visibility
    useEffect(() => { setShowPublic(showPublicChargers); }, [showPublicChargers]);
    useEffect(() => { setShowUser(showUserLocations); }, [showUserLocations]);

    // Sync external selection
    useEffect(() => {
        if(selectedLocationId){
            const found = [...publicChargers, ...userLocations].find(l=>l.id===selectedLocationId);
            if(found) setSelectedLocation(found);
        }
    }, [selectedLocationId, publicChargers, userLocations]);

    // Focus animation when focusLocation provided
    useEffect(() => {
        if(focusLocation && mapRef.current){
            mapRef.current.animateToRegion({
                latitude: focusLocation.latitude,
                longitude: focusLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02
            }, 500);
        }
    }, [focusLocation]);

    const loadChargingLocations = async () => {
        setLoading(true);
        try {
            const { publicChargers: publicData, userLocations: userData } =
                await chargingLocationService.getCombinedChargingLocations(
                    mapRegion.latitude,
                    mapRegion.longitude,
                    searchRadius,
                    showPublic,
                    showUser
                );

            const filteredPublic = showAccommodationOnly ? publicData.filter(c => c.hasAccommodation) : publicData;
            const filteredUser = showAccommodationOnly ? userData.filter(c => c.hasAccommodation) : userData;

            setPublicChargers(filteredPublic);
            setUserLocations(filteredUser);
            if(onLocationsUpdate){
                onLocationsUpdate({
                    public: filteredPublic,
                    user: filteredUser,
                    total: filteredPublic.length + filteredUser.length,
                    region: mapRegion
                });
            }
        } catch (error) {
            console.error('Error loading charging locations:', error);
            showAlert(t('messages.error'), t('messages.failedToLoadLocations'));
        } finally {
            setLoading(false);
        }
    };

    const handleLocationPress = (location) => {
        if (enableLocationSelection) {
            setSelectedLocation(location);
            if (onLocationSelect) {
                onLocationSelect(location);
            }
        }
    };

    const renderPublicChargerMarker = (charger) => (
        <Marker
            key={`public-${charger.id}`}
            coordinate={charger.coordinate}
            title={charger.title}
            description={charger.subtitle}
            onPress={() => handleLocationPress(charger)}
            pinColor={selectedLocation?.id === charger.id ? '#FF4444' : '#FF6B6B'}
        >
            <View style={[
                styles.markerContainer,
                styles.publicMarker,
                (selectedLocation?.id === charger.id || selectedLocationId===charger.id) && styles.selectedMarker
            ]}>
                <MaterialIcons
                    name="ev-station"
                    size={20}
                    color="#FFFFFF"
                />
                {charger.hasAccommodation && (
                    <View style={styles.accommodationBadge}>
                        <MaterialIcons name="hotel" size={12} color="#FFFFFF" />
                    </View>
                )}
                <View style={styles.markerPulse} />
            </View>
        </Marker>
    );

    const renderUserLocationMarker = (location) => (
        <Marker
            key={`user-${location.id}`}
            coordinate={location.coordinate}
            title={location.title}
            description={location.subtitle}
            onPress={() => handleLocationPress(location)}
            pinColor={selectedLocation?.id === location.id ? '#2ECC71' : '#4ECDC4'}
        >
            <View style={[
                styles.markerContainer,
                styles.userMarker,
                (selectedLocation?.id === location.id || selectedLocationId===location.id) && styles.selectedUserMarker
            ]}>
                <MaterialIcons
                    name="home"
                    size={18}
                    color="#FFFFFF"
                />
                {location.hasAccommodation && (
                    <View style={styles.accommodationBadge}>
                        <MaterialIcons name="hotel" size={12} color="#FFFFFF" />
                    </View>
                )}
                <View style={styles.userMarkerPulse} />
                <View style={styles.userMarkerRing} />
            </View>
        </Marker>
    );

    const toggleLocationTypes = () => {
        if (showPublic && showUser) {
            setShowPublic(true);
            setShowUser(false);
        } else if (showPublic && !showUser) {
            setShowPublic(false);
            setShowUser(true);
        } else {
            setShowPublic(true);
            setShowUser(true);
        }
    };

    const getToggleButtonText = () => {
        if (showPublic && showUser) return t('map.showAll');
        if (showPublic && !showUser) return t('map.showPublicOnly');
        return t('map.showUserOnly');
    };

    const getToggleButtonIcon = () => {
        if (showPublic && showUser) return 'visibility';
        if (showPublic && !showUser) return 'ev-station';
        return 'home';
    };

    return (
        <View style={[styles.container, style]}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={true}
                showsScale={true}
                toolbarEnabled={false}
                mapType="standard"
                customMapStyle={mapStyle}
            >
                {/* Render public charger markers */}
                {showPublic && publicChargers.map(renderPublicChargerMarker)}

                {/* Render user location markers */}
                {showUser && userLocations.map(renderUserLocationMarker)}
            </MapView>

            {/* Loading indicator */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#4ECDC4" />
                    <FarsiText style={styles.loadingText}>
                        {t('map.loadingLocations')}
                    </FarsiText>
                </View>
            )}

            {/* Toggle button for location types */}
            <TouchableOpacity
                style={styles.toggleButton}
                onPress={toggleLocationTypes}
            >
                <MaterialIcons
                    name={getToggleButtonIcon()}
                    size={20}
                    color="#FFFFFF"
                />
                <FarsiText style={styles.toggleButtonText}>
                    {getToggleButtonText()}
                </FarsiText>
            </TouchableOpacity>

            {/* Location counter */}
            <View style={styles.counterContainer}>
                <View style={styles.counterItem}>
                    <View style={styles.publicIndicator} />
                    <FarsiText style={styles.counterText}>
                        {showPublic ? publicChargers.length : 0} {t('map.public')}
                    </FarsiText>
                </View>
                <View style={styles.counterItem}>
                    <View style={styles.userIndicator} />
                    <FarsiText style={styles.counterText}>
                        {showUser ? userLocations.length : 0} {t('map.private')}
                    </FarsiText>
                </View>
            </View>

            {/* Selected location info */}
            {selectedLocation && enableLocationSelection && (
                <View style={styles.selectedLocationCard}>
                    <View style={styles.selectedLocationHeader}>
                        <MaterialIcons
                            name={selectedLocation.type === 'public' ? 'ev-station' : 'home'}
                            size={24}
                            color={selectedLocation.type === 'public' ? '#FF6B6B' : '#4ECDC4'}
                        />
                        <View style={styles.selectedLocationInfo}>
                            <FarsiText style={styles.selectedLocationTitle}>
                                {selectedLocation.title}
                            </FarsiText>
                            <FarsiText style={styles.selectedLocationSubtitle}>
                                {selectedLocation.subtitle}
                            </FarsiText>
                        </View>
                        {selectedLocation.hasAccommodation && (
                            <View style={styles.accommodationPill}>
                                <MaterialIcons name="hotel" size={14} color="#fff" />
                                <FarsiText style={styles.accommodationPillText}>{t('messages.hasAccommodation')}</FarsiText>
                            </View>
                        )}
                    </View>
                    <FarsiText style={styles.selectedLocationDescription}>
                        {selectedLocation.description}
                    </FarsiText>
                </View>
            )}
        </View>
    );
};

const mapStyle = [
    {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }]
    }
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    publicMarker: {
        backgroundColor: '#FF6B6B',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userMarker: {
        backgroundColor: '#4ECDC4',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    selectedMarker: {
        backgroundColor: '#FF4444',
        transform: [{ scale: 1.2 }],
    },
    selectedUserMarker: {
        backgroundColor: '#2ECC71',
        transform: [{ scale: 1.2 }],
    },
    markerPulse: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FF6B6B',
        opacity: 0.3,
        zIndex: -1,
    },
    userMarkerPulse: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4ECDC4',
        opacity: 0.3,
        zIndex: -1,
    },
    userMarkerRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#4ECDC4',
        opacity: 0.5,
        zIndex: -2,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    toggleButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 20,
        right: 20,
        backgroundColor: '#4ECDC4',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    toggleButtonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        marginLeft: 5,
        fontSize: 12,
    },
    counterContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 15,
        padding: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    counterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    publicIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FF6B6B',
        marginRight: 8,
    },
    userIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4ECDC4',
        marginRight: 8,
    },
    counterText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    selectedLocationCard: {
        position: 'absolute',
        bottom: 100,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    selectedLocationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    selectedLocationInfo: {
        flex: 1,
        marginLeft: 10,
    },
    selectedLocationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    selectedLocationSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    selectedLocationDescription: {
        fontSize: 14,
        color: '#999',
        lineHeight: 20,
    },
    accommodationBadge: {
        position: 'absolute',
        right: -10,
        top: -10,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    accommodationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4ECDC4',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginLeft: 8,
    },
    accommodationPillText: {
        color: '#fff',
        fontSize: 10,
        marginLeft: 4,
        fontWeight: '600'
    },
});

export default ChargingLocationMap;
