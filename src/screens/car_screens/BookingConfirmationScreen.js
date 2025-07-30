import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";


export default function BookingConfirmationScreen({ navigation, route }) {
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);

    const { car, user, chargingLocation } = route.params;

    const handleCreateBooking = async () => {
        if (!car?.car_id || !chargingLocation?.charging_location_id) {
            Alert.alert(t('messages.error'), t('messages.missingInfo'));
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/add-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,
                },
                body: JSON.stringify({
                    car_id: car.car_id,
                    charging_location_id: chargingLocation.charging_location_id,
                }),
            });

            if (response.ok) {
                const booking = await response.json();
                Alert.alert(
                    t('messages.confirmBooking'),
                    t('messages.stationBooked'),
                    [
                        {
                            text: t('messages.bookingView'),
                            onPress: () => {
                                navigation.navigate('MyBookingsScreen', {
                                    user,
                                    refreshBookings: true
                                });
                            }
                        },
                        {
                            text: t('messages.ok'),
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                const errorData = await response.json();
                Alert.alert(t('messages.failBooking'), errorData.message || t('messages.noCreateBooking'));
            }
        } catch (error) {
            Alert.alert(t('messages.NetError'), t('messages.checkConnection'));
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return price ? `€${parseFloat(price).toFixed(2)}` : 'N/A';
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="confirmation-number" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>{t('messages.bookingConfirm')}</Text>
                    <Text style={styles.subtitle}>
                        {t('messages.review')}
                    </Text>
                </LinearGradient>

                <View style={styles.carInfoCard}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="directions-car" size={24} color="#667eea" />
                        <Text style={styles.cardTitle}>{t('messages.vehicle')}</Text>
                    </View>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>{t('messages.model')}</Text>
                            <Text style={styles.infoValue}>{car?.model || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>{t('messages.licensePlate')}</Text>
                            <Text style={styles.infoValue}>{car?.license_plate || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>{t('messages.yearCar')}</Text>
                            <Text style={styles.infoValue}>{car?.year || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>{t('messages.colorCar')}</Text>
                            <Text style={styles.infoValue}>{car?.color || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.locationCard}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="ev-station" size={24} color="#667eea" />
                        <Text style={styles.cardTitle}>{t('messages.chargingStation')}</Text>
                    </View>
                    <View style={styles.locationInfo}>
                        <View style={styles.locationRow}>
                            <MaterialIcons name="location-on" size={20} color="#666" />
                            <View style={styles.locationDetails}>
                                <Text style={styles.locationText}>
                                    {chargingLocation?.street  || 'Location Street'}
                                </Text>
                                <Text style={styles.locationSubtext}>
                                    {chargingLocation?.city}, {chargingLocation?.post_code}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.featureGrid}>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="electric-bolt" size={20} color="#667eea" />
                                <Text style={styles.featureLabel}>{t('messages.power')}</Text>
                                <Text style={styles.featureValue}>
                                    {chargingLocation?.power_output || 'N/A'} kW
                                </Text>
                            </View>
                            <View style={styles.featureItem}>
                                <MaterialIcons name="speed" size={20} color="#667eea" />
                                <Text style={styles.featureLabel}>{t('messages.chargingType')}</Text>
                                <Text style={styles.featureValue}>
                                    {chargingLocation?.fast_charging ? t('messages.fastCharging') : t('messages.standard')}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.pricingCard}>
                    <View style={styles.cardHeader}>
                        <MaterialIcons name="attach-money" size={24} color="#667eea" />
                        <Text style={styles.cardTitle}>{t('messages.pricingInfo')}</Text>
                    </View>
                    <View style={styles.pricingDetails}>
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>{t('messages.rate')}</Text>
                            <Text style={styles.pricingValue}>
                                {formatPrice(chargingLocation?.price_per_hour)}/hour
                            </Text>
                        </View>
                        <View style={styles.pricingNote}>
                            <MaterialIcons name="info" size={16} color="#ff9800" />
                            <Text style={styles.noteText}>
                                {t('messages.charged')}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.availabilityCard}>
                    <View style={styles.availabilityHeader}>
                        <MaterialIcons
                            name={chargingLocation?.is_available ? "check-circle" : "cancel"}
                            size={24}
                            color={chargingLocation?.is_available ? "#4CAF50" : "#ff6b6b"}
                        />
                        <Text style={[
                            styles.availabilityText,
                            { color: chargingLocation?.is_available ? "#4CAF50" : "#ff6b6b" }
                        ]}>
                            {chargingLocation?.is_available ? t('messages.available') : t('messages.occupy')}
                        </Text>
                    </View>
                    {chargingLocation?.is_available && (
                        <Text style={styles.availabilitySubtext}>
                            {t('messages.stationReady')}
                        </Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.bookButton,
                        (loading || !chargingLocation?.is_available) && styles.bookButtonDisabled
                    ]}
                    onPress={handleCreateBooking}
                    disabled={loading || !chargingLocation?.is_available}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={
                            loading || !chargingLocation?.is_available
                                ? ['#ccc', '#999']
                                : ['#43e97b', '#38f9d7']
                        }
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons
                            name={
                                loading ? "hourglass-empty" :
                                    !chargingLocation?.is_available ? "block" :
                                        "confirmation-number"
                            }
                            size={24}
                            color="#fff"
                        />
                        <Text style={styles.buttonText}>
                            {loading ? "Creating Booking..." :
                                !chargingLocation?.is_available ? "Station Unavailable" :
                                    "Confirm Booking"}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.termsCard}>
                    <MaterialIcons name="assignment" size={20} color="#ff9800" />
                    <Text style={styles.termsText}>
                        {t('messages.ourService')}
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    carInfoCard: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    infoItem: {
        width: '48%',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    locationCard: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    locationInfo: {
        gap: 16,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    locationDetails: {
        marginLeft: 12,
        flex: 1,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    locationSubtext: {
        fontSize: 14,
        color: '#666',
    },
    featureGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    featureLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    featureValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 2,
        textAlign: 'center',
    },
    pricingCard: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    pricingDetails: {
        gap: 12,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pricingLabel: {
        fontSize: 16,
        color: '#666',
    },
    pricingValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#667eea',
    },
    pricingNote: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff8e1',
        borderRadius: 8,
    },
    noteText: {
        fontSize: 12,
        color: '#856404',
        marginLeft: 8,
        flex: 1,
    },
    availabilityCard: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    availabilityHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    availabilityText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    availabilitySubtext: {
        fontSize: 14,
        color: '#666',
    },
    bookButton: {
        margin: 20,
        marginTop: 0,
        borderRadius: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    bookButtonDisabled: {
        elevation: 2,
        shadowOpacity: 0.1,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 12,
    },
    termsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        margin: 20,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
    },
    termsText: {
        fontSize: 12,
        color: '#856404',
        marginLeft: 12,
        flex: 1,
        lineHeight: 16,
    },
});
