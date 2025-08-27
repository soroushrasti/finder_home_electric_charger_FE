import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import FarsiText from './FarsiText';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';


const geocodeAddress = async (address) => {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk'`
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
        console.log('Geocode fetch failed:', err);
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
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
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
            const initialLat = geocodeResult.lat !== undefined ? geocodeResult.lat : geocodeResult.latitude;
            const initialLng = geocodeResult.lng !== undefined ? geocodeResult.lng : geocodeResult.longitude;
            setFinalRegion({
                latitude: initialLat,
                longitude: initialLng,
            });
            setSelectedMarker({ latitude: initialLat, longitude: initialLng });
            setLoading(false);
        };
        initializeMap();
    }, [formData]);

    // On map load, add markers
    const handleMapLoad = (map) => {
        mapRef.current = map;
        setMapLoaded(true);
        clearMarkers();
        // Add all markers from props
        markers.forEach(m => {
            addAdvancedMarker(map, { lat: m.latitude, lng: m.longitude }, m.title);
        });
        // Add selected marker if present
        if (enableTapToSelect && selectedMarker) {
            addAdvancedMarker(map, { lat: selectedMarker.latitude, lng: selectedMarker.longitude }, t('messages.selectedLocation'));
        }
    };

    const containerStyle = {
        width: '100%',
        height: '400px',
    };
    const webCenter = {
        lat: finalRegion?.latitude || 35.6892,
        lng: finalRegion?.longitude || 51.389,
    };
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_API_KEY,
    });

    const handleMapClick = (event) => {
        if (!enableTapToSelect) return;
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setSelectedMarker({ latitude: lat, longitude: lng });
        setConfirmPressed(false); // Reset confirm state on new selection
    };

    // Helper to clear markers
    const clearMarkers = () => {
        markersRef.current.forEach(marker => marker && marker.map && marker.setMap(null));
        markersRef.current = [];
    };

    // Helper to add AdvancedMarkerElement or fallback to Marker
    const addAdvancedMarker = (map, position, title) => {
        if (!window.google || !window.google.maps) return;
        if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
            const marker = new window.google.maps.marker.AdvancedMarkerElement({
                map,
                position,
                title,
            });
            console.log('AdvancedMarkerElement added:', position);
            markersRef.current.push(marker);
            return marker;
        } else if (window.google.maps.Marker) {
            const marker = new window.google.maps.Marker({
                map,
                position,
                title,
            });
            console.log('Fallback Marker added:', position);
            markersRef.current.push(marker);
            return marker;
        } else {
            console.warn('No marker implementation available');
        }
    };

    // Add marker for selected location whenever selectedMarker changes
    React.useEffect(() => {
        if (!mapRef.current) return;
        clearMarkers();
        // Add all markers from props
        markers.forEach(m => {
            addAdvancedMarker(mapRef.current, { lat: m.latitude, lng: m.longitude }, m.title);
        });
        // Add selected marker if present
        if (enableTapToSelect && selectedMarker) {
            addAdvancedMarker(mapRef.current, { lat: selectedMarker.latitude, lng: selectedMarker.longitude }, t('messages.selectedLocation'));
        }
    }, [selectedMarker, markers, enableTapToSelect]);

    useEffect(() => {
        if (mapRef.current && finalRegion) {
            console.log('MapScreen.web.js: finalRegion', finalRegion);
            const lat = Number(finalRegion.latitude);
            const lng = Number(finalRegion.longitude);
            if (isFinite(lat) && isFinite(lng)) {
                mapRef.current.setCenter({ lat, lng });
                mapRef.current.setZoom(15); // or any zoom level you prefer
            } else {
                console.warn('Invalid lat/lng for setCenter:', finalRegion);
            }
        }
    }, [finalRegion]);

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
            {isLoaded ? (
                <GoogleMap
                    key={finalRegion.latitude + ',' + finalRegion.longitude}
                    mapContainerStyle={containerStyle}
                    center={webCenter}
                    zoom={15}
                    onClick={handleMapClick}
                    onLoad={handleMapLoad}
                >
                    {/* No <WebMarker /> usage, markers are managed via AdvancedMarkerElement */}
                </GoogleMap>
            ) : (
                <ActivityIndicator size="large" color="#4285F4" />
            )}
            {enableTapToSelect && selectedMarker && (
                <TouchableOpacity
                    style={{ backgroundColor: confirmPressed ? '#4285F4' : '#cccccc', padding: 10, borderRadius: 8, margin: 8 }}
                    onPress={() => {
                        setConfirmPressed(true);
                        onLocationSelected && onLocationSelected(selectedMarker);
                    }}
                    disabled={confirmPressed}
                >
                    <FarsiText style={{ color: 'white', textAlign: 'center', opacity: confirmPressed ? 1 : 0.6 }}>{t('messages.confirmLocation')}</FarsiText>
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
