import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';
import FarsiText from  "../../components/FarsiText";
import { useTranslation } from 'react-i18next';


export default function MyCarsScreen({ navigation, route }) {
    const { t } = useTranslation();

    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const user = route.params?.user;

    useEffect(() => {
        if (user) {
            fetchCars();
        }
    }, [user]);

    const fetchCars = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-car`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                }),
            });

            if (response.ok) {
                const carsData = await response.json();
                setCars(Array.isArray(carsData) ? carsData : []);
            } else {
                Alert.alert(t('messages.error'), t('messages.failCar'));
            }
        } catch (error) {
            Alert.alert(t('messages.netError'), t('messages.checkConnection'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCars();
    };

    const handleAddCar = () => {
        navigation.navigate('AddCar', {
            user,
            onCarAdded: fetchCars
        });
    };

    const renderCar = ({ item }) => (
        <View style={styles.carCard}>
            <View style={styles.carHeader}>
                <View style={styles.carIconContainer}>
                    <MaterialIcons name="directions-car" size={32} color="#667eea" />
                </View>
                <View style={styles.carInfo}>
                    <Text style={styles.carModel}>{item.model}</Text>
                    <Text style={styles.carDetails}>
                        {item.year} • {item.color} • {item.license_plate}
                    </Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                    <FarsiText style={styles.statusText}>{t('messages.active')}</FarsiText>
                </View>
            </View>

            <View style={styles.carActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <MaterialIcons name="edit" size={18} color="#667eea" />
                    <FarsiText style={styles.actionText}>{t('messages.edit')}</FarsiText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('CarBookings', {
                        car: {
                            car_id: item.car_id,
                            model: item.model,
                            license_plate: item.license_plate,
                            year: item.year,
                            color: item.color
                        },
                        user
                    })}
                >
                    <MaterialIcons name="history" size={18} color="#667eea" />
                    <FarsiText style={styles.actionText}>{t('messages.history')}</FarsiText>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <MaterialIcons name="directions-car" size={64} color="#ccc" />
                <FarsiText style={styles.loadingText}>{t('messages.loadCars')}</FarsiText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <FarsiText style={styles.title}>{t('messages.myElCars')}</FarsiText>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddCar}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#43e97b', '#38f9d7']}
                        style={styles.addButtonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <FarsiText style={styles.addButtonText}>{t('messages.adCar')}</FarsiText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {cars.length === 0 ? (
                <View style={styles.centered}>
                    <MaterialIcons name="directions-car" size={80} color="#ccc" />
                    <FarsiText style={styles.emptyText}>{t('messages.noCarRegister')}</FarsiText>
                    <FarsiText style={styles.emptySubtext}>
                        {t('messages.addFirstCar')}
                    </FarsiText>
                    <TouchableOpacity
                        style={styles.getStartedButton}
                        onPress={handleAddCar}
                    >
                        <FarsiText style={styles.getStartedText}>{t('messages.addFirst')}</FarsiText>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={cars}
                    renderItem={renderCar}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 20,
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    addButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    addButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    listContainer: {
        padding: 20,
        paddingTop: 10,
    },
    carCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    carHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    carIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    carInfo: {
        flex: 1,
    },
    carModel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    carDetails: {
        fontSize: 14,
        color: '#666',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    carActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
    },
    actionText: {
        fontSize: 14,
        color: '#667eea',
        marginLeft: 6,
        fontWeight: '600',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    getStartedButton: {
        backgroundColor: '#667eea',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    getStartedText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
