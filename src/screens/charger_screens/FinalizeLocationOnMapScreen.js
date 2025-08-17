import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import env from "../../config/environment";
import FarsiText from  "../../components/FarsiText";
import {useTranslation} from "react-i18next";


export default function FinalizeLocationOnMapScreen({ route, navigation }) {
    const { t } = useTranslation();

    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [marker, setMarker] = useState(null);
    const [loading, setLoading] = useState(true);
    const formData = route.params?.formData || {};

    useEffect(() => {
        const initializeMap = async () => {
            try {
                // Define fallback coordinates for common locations
                const getLocationFallback = (country, city) => {
                    const fallbackCoordinates = {
                        'iran': {
                            default: { latitude: 35.6892, longitude: 51.3890 }, // Tehran
                            'tehran': { latitude: 35.6892, longitude: 51.3890 },
                            'isfahan': { latitude: 32.6546, longitude: 51.6680 },
                            'shiraz': { latitude: 29.5918, longitude: 52.5837 },
                            'mashhad': { latitude: 36.2974, longitude: 59.6067 },
                            'tabriz': { latitude: 38.0962, longitude: 46.2738 }
                        },
                        'usa': {
                            default: { latitude: 39.8283, longitude: -98.5795 }, // Center of USA
                            'new york': { latitude: 40.7128, longitude: -74.0060 },
                            'los angeles': { latitude: 34.0522, longitude: -118.2437 },
                            'chicago': { latitude: 41.8781, longitude: -87.6298 }
                        },
                        'uk': {
                            default: { latitude: 55.3781, longitude: -3.4360 }, // Center of UK
                            'london': { latitude: 51.5074, longitude: -0.1278 }
                        }
                    };

                    const countryKey = country?.toLowerCase();
                    const cityKey = city?.toLowerCase();

                    if (fallbackCoordinates[countryKey]) {
                        if (cityKey && fallbackCoordinates[countryKey][cityKey]) {
                            return fallbackCoordinates[countryKey][cityKey];
                        }
                        return fallbackCoordinates[countryKey].default;
                    }

                    // Global fallback
                    return { latitude: 35.6892, longitude: 51.3890 }; // Tehran as default
                };

                // Request location permissions
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.log('Location permission denied, using fallback coordinates');

                    // Use predefined coordinates instead of geocoding
                    const fallbackCoords = getLocationFallback(formData.country, formData.city);

                    const fallbackRegion = {
                        latitude: fallbackCoords.latitude,
                        longitude: fallbackCoords.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    };

                    setRegion(fallbackRegion);
                    setMarker({ latitude: fallbackCoords.latitude, longitude: fallbackCoords.longitude });
                    setLoading(false);
                    return;
                }

                // If permission granted, try to get current location first
                let currentLocation;
                try {
                    currentLocation = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                        timeout: 10000,
                    });
                } catch (locationError) {
                    console.log('Could not get current location:', locationError);
                }

                // Try geocoding with the granted permissions
                let geocodeResult = null;

                // 1. First try: street + city + country
                if (formData.street && formData.city && formData.country) {
                    try {
                        const fullAddress = `${formData.street}, ${formData.city}, ${formData.country}`;
                        const geocode = await Location.geocodeAsync(fullAddress);
                        if (geocode.length > 0) {
                            geocodeResult = geocode[0];
                            console.log('Geocoded full address:', fullAddress);
                        }
                    } catch (error) {
                        console.log('Full address geocoding failed:', error);
                    }
                }

                // 2. Second try: city + country
                if (!geocodeResult && formData.city && formData.country) {
                    try {
                        const address = `${formData.city}, ${formData.country}`;
                        const geocode = await Location.geocodeAsync(address);
                        if (geocode.length > 0) {
                            geocodeResult = geocode[0];
                            console.log('Geocoded city + country:', address);
                        }
                    } catch (error) {
                        console.log('City + country geocoding failed:', error);
                    }
                }

                // 3. If geocoding failed, use fallback coordinates
                if (!geocodeResult) {
                    console.log('Geocoding failed, using predefined coordinates');
                    const fallbackCoords = getLocationFallback(formData.country, formData.city);
                    geocodeResult = fallbackCoords;
                }

                // Set the region and marker
                let finalRegion;
                if (geocodeResult) {
                    finalRegion = {
                        latitude: geocodeResult.latitude,
                        longitude: geocodeResult.longitude,
                        latitudeDelta: 0.005, // More zoomed in for street level
                        longitudeDelta: 0.005, // More zoomed in for street level
                    };
                    setMarker({ latitude: geocodeResult.latitude, longitude: geocodeResult.longitude });
                } else if (currentLocation) {
                    finalRegion = {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                        latitudeDelta: 0.005, // More zoomed in for street level
                        longitudeDelta: 0.005, // More zoomed in for street level
                    };
                } else {
                    // Final fallback to Tehran with city-level zoom
                    finalRegion = {
                        latitude: 35.6892,
                        longitude: 51.3890,
                        latitudeDelta: 0.02, // City level zoom for fallback
                        longitudeDelta: 0.02,
                    };
                }

                setRegion(finalRegion);

            } catch (error) {
                console.error('Map initialization error:', error);
                // Use Tehran as ultimate fallback
                setRegion({
                    latitude: 35.6892,
                    longitude: 51.3890,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            } finally {
                setLoading(false);
            }
        };

        initializeMap();
    }, [formData]);

    const handleMapPress = (event) => {
        setMarker(event.nativeEvent.coordinate);
    };

    const handleConfirm = () => {
        if (!marker) {
            Alert.alert(t('messages.selectLocation'), t('messages.tapOnMap'));
            return;
        }
        handleAddLocationWithCoordinates(marker);
    };

    const validateForm = () => {
        if (!formData.name || !formData.city || !formData.postcode || !formData.street) {
            Alert.alert(t('messages.incompleteForm'), t('messages.fillFields'));
            return false;
        }
        return true;
    };

    const handleAddLocationWithCoordinates = async (location) => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const requestBody = {
                ...formData,
                latitude: location.latitude,
                longitude: location.longitude,
            };

            const response = await fetch(`${env.apiUrl}/add-charging-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-Token': `${env.apiToken}`,
                },
                body: JSON.stringify(requestBody),
                timeout: 10000, // 10 second timeout
            });

            console.log(t('messages.responseStat'), response.status);
            console.log(t('messages.responseHeader'), response.headers);

            if (response.ok) {
                const responseData = await response.json();
                console.log(t('messages.responseSuccess'), responseData);

                Alert.alert(t('messages.success'), t('messages.addStation'), [
                    { text: 'OK', onPress: () => {
                            if (route.params?.onLocationAdded) {
                                route.params.onLocationAdded();
                            }
                            navigation.navigate('MyChargerLocationScreen', { user: {user_id: formData.user_id}});
                        }}
                ]);
            } else {
                const errorText = await response.text();
                console.error(t('messages.apiError'), response.status, errorText);
                Alert.alert(t('messages.error'), `Failed to add charging station: ${response.status} ${errorText}`);
            }
        } catch (error) {
            console.error(t('messages.netError'), error);

            if (error.message.includes(t('messages.netRequest'))) {
                Alert.alert(
                    t('messages.NetError'),
                    t('messages.noConnectToServer'),
                    [
                        { text: t('messages.retry'), onPress: () => handleAddLocationWithCoordinates(location) },
                        { text: t('messages.cancel'), style: t('messages.cancel') }
                    ]
                );
            } else {
                Alert.alert(t('messages.error'), `Network error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4285F4" />
                <FarsiText style={styles.loadingText}>{t('messages.findingLoc')}</FarsiText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <FarsiText style={styles.headerText}>{t('messages.selectExactLocation')}</FarsiText>
                <FarsiText style={styles.subHeaderText}>{t('messages.tapPosition')}</FarsiText>
            </View>

            {region && (
                <MapView
                    style={styles.map}
                    region={region}
                    onPress={handleMapPress}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                    showsCompass={true}
                    showsScale={true}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                    zoomControlEnabled={true}
                    mapType="standard"
                    toolbarEnabled={false}
                >
                    {marker && (
                        <Marker
                            coordinate={marker}
                            title="Charging Station"
                            description={formData.name}
                            pinColor="red"
                        />
                    )}
                </MapView>
            )}

            <View style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                    <MaterialIcons name="check" size={24} color="#fff" />
                    <FarsiText style={styles.confirmButtonText}>{t('messages.confirmLoc')}</FarsiText>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    subHeaderText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    map: {
        flex: 1,
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    confirmButton: {
        backgroundColor: '#4285F4',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
