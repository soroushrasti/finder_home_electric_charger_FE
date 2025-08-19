import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import FarsiText from '../../components/FarsiText';
import { useTranslation } from 'react-i18next';

export default function MapScreen({ initialRegion, initialMarker, onLocationSelected, formData }) {
    const { t } = useTranslation();
    const [region, setRegion] = useState(initialRegion || {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [marker, setMarker] = useState(initialMarker || null);
    const [loading, setLoading] = useState(true);

    function isValidRegion(region) {
        return (
            typeof region?.latitude === 'number' &&
            typeof region?.longitude === 'number' &&
            typeof region?.latitudeDelta === 'number' &&
            typeof region?.longitudeDelta === 'number' &&
            !isNaN(region.latitude) &&
            !isNaN(region.longitude) &&
            !isNaN(region.latitudeDelta) &&
            !isNaN(region.longitudeDelta)
        );
    }

    useEffect(() => {
        const initializeMap = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    t('Permission Denied'),
                    t('Location permission is required to show the map. Showing default location.'),
                );
                setRegion({
                    latitude: 35.6892,
                    longitude: 51.3890,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
                setLoading(false);
                return;
            }
            try {
                const getLocationFallback = (country, city) => {
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
                };
                let geocodeResult = null;
                if (formData?.street && formData?.city && formData?.country) {
                    try {
                        const fullAddress = `${formData.street}, ${formData.city}, ${formData.country}`;
                        const geocode = await Location.geocodeAsync(fullAddress);
                        if (geocode.length > 0) {
                            geocodeResult = geocode[0];
                        }
                    } catch {}
                }
                if (!geocodeResult && formData?.city && formData?.country) {
                    try {
                        const address = `${formData.city}, ${formData.country}`;
                        const geocode = await Location.geocodeAsync(address);
                        if (geocode.length > 0) {
                            geocodeResult = geocode[0];
                        }
                    } catch {}
                }
                if (!geocodeResult) {
                    geocodeResult = getLocationFallback(formData?.country, formData?.city);
                }
                let finalRegion = region;
                if (geocodeResult &&
                    typeof geocodeResult.latitude === 'number' &&
                    typeof geocodeResult.longitude === 'number') {
                    finalRegion = {
                        latitude: geocodeResult.latitude,
                        longitude: geocodeResult.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    };
                    setMarker({ latitude: geocodeResult.latitude, longitude: geocodeResult.longitude });
                } else {
                    finalRegion = {
                        latitude: 35.6892,
                        longitude: 51.3890,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    };
                }
                console.log('MapScreen: finalRegion', finalRegion);
                setRegion(finalRegion);
            } catch (err) {
                console.log('MapScreen: error in initializeMap', err);
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
        if (onLocationSelected) {
            onLocationSelected(event.nativeEvent.coordinate);
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
    if (!isValidRegion(region)) {
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
                region={region}
                onPress={handleMapPress}
                showsScale={true}
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={true}
                rotateEnabled={true}
                zoomControlEnabled={true}
                mapType="standard" // changed from satellite to standard
                toolbarEnabled={false}
            >
                {marker && (
                    <Marker
                        coordinate={marker}
                        title="Charging Station"
                        pinColor="red"
                    />
                )}
            </MapView>
            {/* Debug info for troubleshooting */}
            <View style={{position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(255,255,255,0.8)', padding: 5, borderRadius: 5}}>
                <FarsiText>Region: {JSON.stringify(region)}</FarsiText>
                <FarsiText>Marker: {JSON.stringify(marker)}</FarsiText>
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
    map: {
        flex: 1,
    },
});
