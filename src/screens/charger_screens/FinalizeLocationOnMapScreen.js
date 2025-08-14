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
                // Request location permissions
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t('messages.permissionDeny'), t('messages.locPermission'));

                    let fallbackLocation = null;

                    // Try to geocode street + city + country first
                    if (formData.street && formData.city && formData.country) {
                        try {
                            const address = `${formData.street}, ${formData.city}, ${formData.country}`;
                            const geocode = await Location.geocodeAsync(address);
                            if (geocode.length > 0) {
                                fallbackLocation = geocode[0];
                                console.log('Using street + city + country fallback:', address);
                            }
                        } catch (error) {
                            console.log('Street + city + country geocoding failed:', error);
                        }
                    }

                    // If street+city+country failed, try city + country
                    if (!fallbackLocation && formData.city && formData.country) {
                        try {
                            const address = `${formData.city}, ${formData.country}`;
                            const geocode = await Location.geocodeAsync(address);
                            if (geocode.length > 0) {
                                fallbackLocation = geocode[0];
                                console.log('Using city + country fallback:', address);
                            }
                        } catch (error) {
                            console.log('City + country geocoding failed:', error);
                        }
                    }

                    // If city+country failed, try country only
                    if (!fallbackLocation && formData.country) {
                        try {
                            const geocode = await Location.geocodeAsync(formData.country);
                            if (geocode.length > 0) {
                                fallbackLocation = geocode[0];
                                console.log('Using country fallback:', formData.country);
                            }
                        } catch (error) {
                            console.log('Country geocoding failed:', error);
                        }
                    }

                    // Set region based on fallback location or default
                    if (fallbackLocation) {
                        const fallbackRegion = {
                            latitude: fallbackLocation.latitude,
                            longitude: fallbackLocation.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        };
                        setRegion(fallbackRegion);
                    } else {
                        // Use default coordinates as final fallback
                        setRegion({
                            latitude: 37.78825,
                            longitude: -122.4324,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        });
                    }

                    setLoading(false);
                    return;
                }

                // Get current location as fallback
                let currentLocation;
                try {
                    currentLocation = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    });
                } catch (locationError) {
                    console.log('Could not get current location:', locationError);
                }

                // Initialize default region
                let defaultRegion = {
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                };

                if (currentLocation) {
                    defaultRegion = {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                }

                // Try geocoding with fallback logic
                let geocodeResult = null;

                // 1. First try: country + city
                if (formData.country && formData.city) {
                    const fullAddress = `${formData.city}, ${formData.country}`;
                    try {
                        const geocode = await Location.geocodeAsync(fullAddress);
                        if (geocode.length > 0) {
                            geocodeResult = geocode[0];
                            console.log('Geocoded full address:', fullAddress);
                        }
                    } catch (error) {
                        console.log('Full address geocoding failed:', error);
                    }
                }

                // 2. Second try: city only
                if (!geocodeResult && formData.city) {
                    try {
                        const geocode = await Location.geocodeAsync(formData.city);
                        if (geocode.length > 0) {
                            geocodeResult = geocode[0];
                            console.log('Geocoded city only:', formData.city);
                        }
                    } catch (error) {
                        console.log('City geocoding failed:', error);
                    }
                }

                // 3. Third try: country (if available in formData)
                if (!geocodeResult && formData.country) {
                    try {
                        const geocode = await Location.geocodeAsync(formData.country);
                        if (geocode.length > 0) {
                            geocodeResult = geocode[0];
                            console.log('Geocoded country:', formData.country);
                        }
                    } catch (error) {
                        console.log('Country geocoding failed:', error);
                    }
                }

                // Set the region based on geocoding result or default
                if (geocodeResult) {
                    const { latitude, longitude } = geocodeResult;
                    const geocodedRegion = {
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                    setRegion(geocodedRegion);
                    setMarker({ latitude, longitude });
                } else {
                    setRegion(defaultRegion);
                }

            } catch (error) {
                console.error('Map initialization error:', error);
                // Use default location
                setRegion({
                    latitude: 37.78825,
                    longitude: -122.4324,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
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

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (response.ok) {
                const responseData = await response.json();
                console.log('Success response:', responseData);

                Alert.alert('Success', 'Charging station added successfully!', [
                    { text: 'OK', onPress: () => {
                            if (route.params?.onLocationAdded) {
                                route.params.onLocationAdded();
                            }
                            navigation.navigate('MyChargerLocationScreen', { user: {user_id: formData.user_id}});
                        }}
                ]);
            } else {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                Alert.alert('Error', `Failed to add charging station: ${response.status} ${errorText}`);
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
