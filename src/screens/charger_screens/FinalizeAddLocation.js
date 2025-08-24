import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import env from '../../config/environment';
import FarsiText from '../../components/FarsiText';
import { useTranslation } from 'react-i18next';
import MapScreen from '../../components/MapScreen';

export default function FinalizeAddLocation({ route, navigation }) {
    const { t } = useTranslation();
    const formData = route.params?.formData || {};
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const validateForm = () => {
        if (!formData.name || !formData.city || !formData.postcode || !formData.street) {
            Alert.alert(t('messages.incompleteForm'), t('messages.fillFields'));
            return false;
        }
        return true;
    };

    const handleLocationSelected = (location) => {
        setSelectedLocation(location);
    };

    const handleConfirm = async () => {
        if (!selectedLocation) return;
        if (!validateForm()) return;
        setLoading(true);
        try {
            let url = '';
            let method = 'POST';
            let requestBody = { ...formData, latitude: selectedLocation.latitude, longitude: selectedLocation.longitude };
            if (formData.charging_location_id) {
                url = `${env.apiUrl}/update-charging-location/${formData.charging_location_id}`;
            } else if (route.params?.isFindLocation) {
                url = `${env.apiUrl}/find-charging-location`;
            } else {
                url = `${env.apiUrl}/add-charging-location`;
            }
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-API-Token': `${env.apiToken}`,
                },
                body: JSON.stringify(requestBody),
                timeout: 10000,
            });
            if (response.ok) {
                        navigation.navigate('HomeOwnerScreen', { user: { user_id: formData.user_id } });
            } else {
                const errorText = await response.text();
                Alert.alert(t('messages.error'), `Failed: ${response.status} ${errorText}`);
            }
        } catch (error) {
            Alert.alert(t('messages.error'), `Network error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <FarsiText style={styles.headerText}>{t('messages.selectExactLocation')}</FarsiText>
                <FarsiText style={styles.subHeaderText}>{t('messages.tapPosition')}</FarsiText>
            </View>
            <View style={styles.mapContainer}>
                <MapScreen
                    formData={formData}
                    onLocationSelected={handleLocationSelected}
                    enableTapToSelect={true}
                />
            </View>
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirm}
                    disabled={loading || !selectedLocation}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <MaterialIcons name="check" size={24} color="#fff" />
                    )}
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
    mapContainer: {
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
