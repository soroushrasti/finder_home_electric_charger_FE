import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import env from "../../config/environment";
import FarsiText from  "../../components/FarsiText";
import FarsiTextInput from  "../../components/FarsiTextInput";
import {useTranslation} from "react-i18next";


export default function FinalizeLocationOnMapScreen({ route, navigation }) {
    const { t } = useTranslation();

    const [region, setRegion] = useState(null);
    const [marker, setMarker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const formData = route.params?.formData || {};

    useEffect(() => {
        const initializeMap = async () => {
            try {
                // Request location permissions
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(t('messages.permissionDeny'), t('messages.locPermission'));
                    setDefaultLocation();
                    return;
                }

                // Try to geocode the address from form data
                const address = `${formData.street}, ${formData.city}, ${formData.postcode}`;
                const geocode = await Location.geocodeAsync(address);

                if (geocode.length > 0) {
                    const { latitude, longitude } = geocode[0];
                    const initialRegion = {
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                    setRegion(initialRegion);
                    setMarker({ latitude, longitude });
                } else {
                    // Fallback: try just city and postcode
                    const cityAddress = `${formData.city}, ${formData.postcode}`;
                    const cityGeocode = await Location.geocodeAsync(cityAddress);

                    if (cityGeocode.length > 0) {
                        const { latitude, longitude } = cityGeocode[0];
                        const initialRegion = {
                            latitude,
                            longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        };
                        setRegion(initialRegion);
                        Alert.alert(t('messages.noAddress'), t('messages.addressNotFind'));
                    } else {
                        setDefaultLocation();
                    }
                }
            } catch (error) {
                console.error(t('messages.geoError'), error);
                Alert.alert(t('messages.error'), t('messages.locNotFind'));
                setDefaultLocation();
            } finally {
                setLoading(false);
            }
        };

        initializeMap();
    }, [formData]);

    const setDefaultLocation = () => {
        // Default to a central location if geocoding fails
        setRegion({
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        });
        Alert.alert(t('messages.noLoc'), t('messages.noAddressFound'));
    };

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

            console.log('API URL:', `${env.apiUrl}/add-charging-location`);
            console.log('Request body:', requestBody);

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
                zoomControlEnabled={true} // This enables zoom controls on Android
                mapType="standard"
                toolbarEnabled={false} // Disable Google Maps toolbar on Android
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
