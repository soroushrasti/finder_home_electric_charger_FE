import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";

export default function CarSelectionScreen({ navigation, route }) {
    const { t } = useTranslation();

    const { user, chargingLocation } = route.params;
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState(null);

    useEffect(() => {
        fetchUserCars();
    }, []);

    const fetchUserCars = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-car`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,
                },
                body: JSON.stringify({
                    "car_owner_user_id": user.user_id
                })
            });

            const data = await response.json();

            if (response.ok) {
                setCars(data);
            } else {
                Alert.alert(t('messages.error'), data.message || t('messages.failFetchCar'));
            }
        } catch (error) {
            console.error(t('messages.fetchError'), error);
            Alert.alert(t('messages.error'), t('messages.tryAgain'));
        } finally {
            setLoading(false);
        }
    };

    const handleCarSelection = (car) => {
        setSelectedCar(car);
    };

    const handleConfirmSelection = () => {
        if (!selectedCar) {
            Alert.alert(t('messages.error'), t('messages.selectCar'));
            return;
        }

        // Navigate to BookingConfirmationScreen with selected car and charging location
        navigation.navigate('BookingConfirmationScreen', {
            user,
            selectedCar,
            chargingLocation
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>{t('messages.loading')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <MaterialIcons name="directions-car" size={40} color="#fff" />
                    <FarsiText style={styles.headerTitle}>{t('messages.selectYourCar')}</FarsiText>
                    <FarsiText style={styles.headerSubtitle}>{t('messages.chooseCar')}</FarsiText>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.carsContainer}>
                    {cars.length === 0 ? (
                        <View style={styles.noCarsContainer}>
                            <MaterialIcons name="directions-car" size={80} color="#ccc" />
                            <FarsiText style={styles.noCarsText}>{t('messages.noCars')}</FarsiText>
                            <FarsiText style={styles.noCarsSubtext}>{t('messages.addCarToProfile')}</FarsiText>
                            <TouchableOpacity
                                style={styles.addCarButton}
                                onPress={() => navigation.navigate('MyCarScreen', { user })}
                            >
                                <FarsiText style={styles.addCarButtonText}>{t('messages.addedCar')}</FarsiText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        cars.map((car) => (
                            <TouchableOpacity
                                key={car.car_id}
                                style={[
                                    styles.carCard,
                                    selectedCar?.car_id === car.car_id && styles.selectedCarCard
                                ]}
                                onPress={() => handleCarSelection(car)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.carInfo}>
                                    <View style={styles.carIconContainer}>
                                        <MaterialIcons
                                            name="directions-car"
                                            size={32}
                                            color={selectedCar?.car_id === car.car_id ? "#4CAF50" : "#666"}
                                        />
                                    </View>
                                    <View style={styles.carDetails}>
                                        <Text style={styles.carName}>
                                            {car.make} {car.model}
                                        </Text>
                                        <FarsiText style={styles.carYear}>{t('messages.year')}: {car.year}</FarsiText>
                                        <FarsiText style={styles.carPlate}>{t('messages.plate')}: {car.license_plate}</FarsiText>
                                        {car.battery_capacity && (
                                            <FarsiText style={styles.carBattery}>
                                                {t('messages.battery')}: {car.battery_capacity} kWh
                                            </FarsiText>
                                        )}
                                    </View>
                                </View>
                                {selectedCar?.car_id === car.car_id && (
                                    <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {cars.length > 0 && (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                !selectedCar && styles.confirmButtonDisabled
                            ]}
                            onPress={handleConfirmSelection}
                            disabled={!selectedCar}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={selectedCar ? ['#4CAF50', '#45a049'] : ['#ccc', '#999']}
                                style={styles.confirmButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <MaterialIcons name="check" size={24} color="#fff" />
                                <FarsiText style={styles.confirmButtonText}>{t('messages.confirmSelect')}</FarsiText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1,
        padding: 8,
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    carsContainer: {
        padding: 20,
    },
    noCarsContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    noCarsText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 16,
    },
    noCarsSubtext: {
        fontSize: 16,
        color: '#666',
        marginTop: 8,
        textAlign: 'center',
    },
    addCarButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
    },
    addCarButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    carCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCarCard: {
        borderColor: '#4CAF50',
        backgroundColor: '#f8fff8',
    },
    carInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    carIconContainer: {
        marginRight: 16,
    },
    carDetails: {
        flex: 1,
    },
    carName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    carYear: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    carPlate: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    carBattery: {
        fontSize: 14,
        color: '#666',
    },
    buttonContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    confirmButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    confirmButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        gap: 10,
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});
