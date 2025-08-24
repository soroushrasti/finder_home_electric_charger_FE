import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import FarsiText from './FarsiText';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';

const GOOGLE_API_KEY = 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk';

const geocodeAddress = async (address) => {
    try {
        console.log('GOOGLE_API_KEY: ', GOOGLE_API_KEY);
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            return data.results[0].geometry.location;
        } else {
            return null;
        }
    } catch (err) {
        return null;
    }
};

function getLocationFallback(country, city) {
    // ...existing fallback logic...
    const fallbackCoordinates = {
        'iran': {
            default: { latitude: 35.6892, longitude: 51.3890 },
            'tehran': { latitude: 35.6892, longitude: 51.3890 },
            'isfahan': { latitude: 32.6546, longitude: 51.6680 },
            'shiraz': { latitude: 29.5918, longitude: 52.5837 },
            'mashhad': { latitude: 36.2974, longitude: 59.6067 },
            'tabriz': { latitude: 38.0962, longitude: 46.2738 }
        },
        'usa': {
            default: { latitude: 39.8283, longitude: -98.5795 },
            'new york': { latitude: 40.7128, longitude: -74.0060 },
            'los angeles': { latitude: 34.0522, longitude: -118.2437 },
            'chicago': { latitude: 41.8781, longitude: -87.6298 }
        },
        'uk': {
            default: { latitude: 55.3781, longitude: -3.4360 },
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
    return { latitude: 35.6892, longitude: 51.3890 };
}

export default function MapScreen({
    region,
    markers = [],
    onRegionChangeComplete,
    onMarkerPress,
    formData,
    onLocationSelected,
    enableTapToSelect = false,
}) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [finalRegion, setFinalRegion] = useState(region);
    const [selectedMarker, setSelectedMarker] = useState(null);

    function isValidRegion(r) {
        return (
            typeof r?.latitude === 'number' &&
            typeof r?.longitude === 'number' &&
            typeof r?.latitudeDelta === 'number' &&
            typeof r?.longitudeDelta === 'number' &&
            !isNaN(r.latitude) &&
            !isNaN(r.longitude) &&
            !isNaN(r.latitudeDelta) &&
            !isNaN(r.longitudeDelta)
        );
    }

    useEffect(() => {
        const initializeMap = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        t('Permission Denied'),
                        t('Location permission is required to show the map. Showing default location.')
                    );
                    setFinalRegion(getLocationFallback(formData?.country, formData?.city));
                    setLoading(false);
                    return;
                }

                let geocodeResult = null;
                if (formData?.street && formData?.city && formData?.country) {
                    const fullAddress = `${formData.street}, ${formData.city}, ${formData.country}`;
                    geocodeResult = await geocodeAddress(fullAddress);
                }
                if (!geocodeResult && formData?.city && formData?.country) {
                    const address = `${formData.city}, ${formData.country}`;
                    geocodeResult = await geocodeAddress(address);
                }
                if (!geocodeResult) {
                    geocodeResult = getLocationFallback(formData?.country, formData?.city);
                }

                let initialLat = geocodeResult.lat !== undefined ? geocodeResult.lat : geocodeResult.latitude;
                let initialLng = geocodeResult.lng !== undefined ? geocodeResult.lng : geocodeResult.longitude;

                if (
                    typeof initialLat === 'number' &&
                    typeof initialLng === 'number'
                ) {
                    setFinalRegion({
                        latitude: initialLat,
                        longitude: initialLng,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    });
                    setSelectedMarker({ latitude: initialLat, longitude: initialLng });
                } else {
                    setFinalRegion({
                        latitude: 35.6892,
                        longitude: 51.3890,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    });
                    setSelectedMarker({ latitude: 35.6892, longitude: 51.3890 });
                }
            } catch (err) {
                Alert.alert(
                    t('Unexpected error'),
                    t('Could not load location. Showing default.')
                );
                setFinalRegion({
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
        if (!enableTapToSelect) return;
        const coordinate = event.nativeEvent.coordinate;
        setSelectedMarker(coordinate);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4285F4" />
                <FarsiText style={styles.loadingText}>{t('messages.findingLoc')}</FarsiText>
            </View>
        );
    }
    if (!isValidRegion(finalRegion)) {
        return (
            <View style={styles.centered}>
                <FarsiText style={styles.loadingText}>{t('messages.mapError')}</FarsiText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={finalRegion}
                onRegionChangeComplete={onRegionChangeComplete}
                showsScale
                zoomEnabled
                scrollEnabled
                pitchEnabled
                rotateEnabled
                zoomControlEnabled
                mapType="standard"
                toolbarEnabled={false}
                onPress={handleMapPress}
            >
                {markers.map((m, idx) => (
                    <Marker
                        key={idx}
                        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                        title={m.title}
                        description={m.description}
                        pinColor={m.selected ? 'blue' : 'red'}
                        onPress={() => onMarkerPress && onMarkerPress(m)}
                    />
                ))}
                {enableTapToSelect && selectedMarker && (
                    <Marker
                        coordinate={selectedMarker}
                        title={t('messages.selectedLocation')}
                        pinColor="green"
                    />
                )}
            </MapView>
            {enableTapToSelect && selectedMarker && (
                <TouchableOpacity
                    style={{ backgroundColor: '#4285F4', padding: 10, borderRadius: 8, margin: 8 }}
                    onPress={() => onLocationSelected && onLocationSelected(selectedMarker)}
                >
                    <FarsiText style={{ color: 'white', textAlign: 'center' }}>{t('messages.confirmLocation')}</FarsiText>
                </TouchableOpacity>
            )}
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
    map: {
        flex: 1,
    },
});
