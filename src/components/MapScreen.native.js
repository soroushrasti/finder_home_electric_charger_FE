import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import FarsiText from './FarsiText';
import { useTranslation } from 'react-i18next';
import MapView, { Marker } from 'react-native-maps';
import Constants from 'expo-constants';

// Robust Google API key loading for dev/prod
let GOOGLE_API_KEY = null;
if (Constants.expoConfig && Constants.expoConfig.android && Constants.expoConfig.android.config && Constants.expoConfig.android.config.googleMaps) {
    GOOGLE_API_KEY = Constants.expoConfig.android.config.googleMaps.apiKey;
} else if (Constants.manifest && Constants.manifest.android && Constants.manifest.android.config && Constants.manifest.android.config.googleMaps) {
    GOOGLE_API_KEY = Constants.manifest.android.config.googleMaps.apiKey;
} else if (process.env.GOOGLE_MAPS_API_KEY) {
    GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
}
if (!GOOGLE_API_KEY) {
    console.error('Google Maps API key not found!');
}
console.log('Loaded GOOGLE_API_KEY:', GOOGLE_API_KEY);

const geocodeAddress = async (address) => {
    try {
        console.log('Geocode GOOGLE_API_KEY: ', GOOGLE_API_KEY);
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            console.log('Geocode succeeded:', data.results[0].geometry.location);
            return data.results[0].geometry.location;
        } else {
            console.log('Geocoding error:', data.status, data.error_message);
            return null;
        }
    } catch (err) {
        console.log('Geocoding error:', err);
        return null;
    }
};

function getLocationFallback(country, city) {
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
    formData,
    onLocationSelected,
    enableTapToSelect = false,
}) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [finalRegion, setFinalRegion] = useState(region);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [confirmPressed, setConfirmPressed] = useState(false);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    useEffect(() => {
        const initializeMap = async () => {
            let geocodeResult = null;
            console.log(formData, 'formData');
            console.log(region, 'initial region');
            // use intial regioon if exist
            if (region && typeof region.latitude === 'number' && typeof region.longitude === 'number') {
                geocodeResult = { lat: region.latitude, lng: region.longitude };
            }
            if (!geocodeResult && formData?.street && formData?.city && formData?.country) {
                const fullAddress = `${formData.street}, ${formData.city}, ${formData.country}`;
                geocodeResult = await geocodeAddress(fullAddress);
                console.log(`Tried geocoding full address: ${fullAddress}`, geocodeResult);
            }
            if (!geocodeResult && formData?.city) {
                const address = `${formData.city}`;
                geocodeResult = await geocodeAddress(address);
                console.log(`Tried geocoding city, country: ${address}`, geocodeResult);

            }
            if (!geocodeResult) {
                geocodeResult = getLocationFallback(formData?.country, formData?.city);
                console.log('Using fallback location:', geocodeResult);
            }
            // Fix: use correct property names from geocodeResult
            console.log(geocodeResult);
            const initialLat = geocodeResult.lat !== undefined ? geocodeResult.lat : geocodeResult.latitude;
            const initialLng = geocodeResult.lng !== undefined ? geocodeResult.lng : geocodeResult.longitude;
            setFinalRegion({
                latitude: initialLat,
                longitude: initialLng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            setSelectedMarker({ latitude: initialLat, longitude: initialLng });
            setLoading(false);
        };
        initializeMap();
    }, [formData]);

    const handleMapPress = (event) => {
        if (!enableTapToSelect) return;
        console.log('Map pressed at:', event.nativeEvent.coordinate);
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedMarker({ latitude, longitude });
        setConfirmPressed(false); // Reset confirm state on new selection
    };

    useEffect(() => {
        if (mapRef.current && finalRegion) {
            console.log('finalRegion:', finalRegion);
            mapRef.current.animateToRegion(finalRegion, 500);
        }
    }, [finalRegion]);

    if (loading || !finalRegion) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4285F4" />
                <FarsiText style={styles.loadingText}>{t('messages.findingLoc')}</FarsiText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={finalRegion}
                region={finalRegion}
                onPress={handleMapPress}
                onRegionChangeComplete={onRegionChangeComplete}
                showsUserLocation={true}
                provider={MapView.PROVIDER_GOOGLE}
            >
                {markers.map((m, idx) => (
                    <Marker
                        key={m.id || idx}
                        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
                        title={m.title}
                        description={m.description}
                        pinColor={selectedMarker && selectedMarker.latitude === m.latitude && selectedMarker.longitude === m.longitude ? 'blue' : 'red'}
                        onPress={() => onLocationSelected && onLocationSelected(m)}
                    />
                ))}
                {enableTapToSelect && selectedMarker && (
                    <Marker
                        coordinate={selectedMarker}
                        title={t('messages.selectedLocation')}
                        pinColor="blue"
                    />
                )}
            </MapView>
            {enableTapToSelect && selectedMarker && (
                <TouchableOpacity
                    style={{ backgroundColor: confirmPressed ? '#4CAF50' : '#F44336', padding: 10, borderRadius: 8, margin: 8 }}
                    onPress={() => {
                        setConfirmPressed(true);
                        onLocationSelected && onLocationSelected(selectedMarker);
                    }}
                    disabled={confirmPressed}
                >
                    <FarsiText style={{ color: 'white', textAlign: 'center', opacity: confirmPressed ? 1 : 0.6 }}>{!confirmPressed ? t('messages.toBeConfirmed') : t('messages.isConfirmed')}</FarsiText>
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
