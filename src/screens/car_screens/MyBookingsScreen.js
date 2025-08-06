import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';
import FarsiText from  "../../components/FarsiText";
import { useTranslation } from 'react-i18next';


export default function MyBookingsScreen({ navigation, route }) {
    const { t } = useTranslation();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { user } = route.params || {};
    const user_type = user.user_type;
    const car_owner = user_type === null || user_type === 'Electric car owner';
    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    const fetchBookings = async () => {
        try {
            let body;

            if (car_owner) {
                body = JSON.stringify({
                car_owner_user_id: user.user_id,
            });}
            else{
                 body= JSON.stringify({
                    charger_location_owner_user_id: user.user_id,
                });
            }

            const response = await fetch(`${env.apiUrl}/find-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Token': `${env.apiToken} `,
                },
                body: body,
            });

            if (response.ok) {
                const data = await response.json();
                setBookings(Array.isArray(data) ? data : []);
            } else {
                Alert.alert(t('messages.error'), t('messages.failFetchBooking'));
            }
        } catch (error) {
            Alert.alert(t('messages.NetError'), t('messages.checkConnection'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleEndBooking = (booking) => {
        navigation.navigate('EndBooking', {
            booking,
            user,
            onBookingEnded: fetchBookings
        });
    };

    const getStatusInfo = (item) => {
        if (item.end_time) {
            return {
                status: 'Completed',
                color: '#4CAF50',
                icon: 'check-circle'
            };
        } else {
            return {
                status: 'Active',
                color: '#ff9800',
                icon: 'flash-on'
            };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderBooking = ({ item }) => {
        const statusInfo = getStatusInfo(item);

        return (
            <View style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                    <View style={styles.bookingIdContainer}>
                        <MaterialIcons name="confirmation-number" size={20} color="#667eea" />
                        <Text style={styles.bookingId}>{item.car.model} at {item.charging_location.city}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                        <MaterialIcons name={statusInfo.icon} size={16} color="#fff" />
                        <Text style={styles.statusText}>{statusInfo.status}</Text>
                    </View>
                </View>

                <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                        <MaterialIcons name="directions-car" size={18} color="#666" />
                        <FarsiText style={styles.detailLabel}>{t('messages.carLicense')} </FarsiText>
                        <Text style={styles.detailValue}>{item.car.license_plate}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialIcons name="location-on" size={18} color="#666" />
                        <FarsiText style={styles.detailLabel}>{t('messages.locAddress')}  </FarsiText>
                        <Text style={styles.detailValue}>{item.charging_location.street}, {item.charging_location.alley}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <MaterialIcons name="schedule" size={18} color="#666" />
                        <FarsiText style={styles.detailLabel}>{t('messages.started')} , ':'</FarsiText>
                        <Text style={styles.detailValue}>{formatDate(item.start_time)}</Text>
                    </View>

                    {item.end_time && (
                        <View style={styles.detailRow}>
                            <MaterialIcons name="event-available" size={18} color="#666" />
                            <FarsiText style={styles.detailLabel}>{t('messages.ended')}</FarsiText>
                            <Text style={styles.detailValue}>{formatDate(item.end_time)}</Text>
                        </View>
                    )}

                    {item.review_rate && (
                        <View style={styles.detailRow}>
                            <MaterialIcons name="star" size={18} color="#FFD700" />
                            <FarsiText style={styles.detailLabel}>{t('messages.rating')}</FarsiText>
                            <View style={styles.ratingContainer}>
                                {[...Array(5)].map((_, index) => (
                                    <MaterialIcons
                                        key={index}
                                        name={index < item.review_rate ? "star" : "star-border"}
                                        size={16}
                                        color="#FFD700"
                                    />
                                ))}
                                <Text style={styles.ratingText}>({item.review_rate}/5)</Text>
                            </View>
                        </View>
                    )}

                    {item.review_message && (
                        <View style={styles.reviewContainer}>
                            <MaterialIcons name="comment" size={18} color="#666" />
                            <Text style={styles.reviewText}>{item.review_message}</Text>
                        </View>
                    )}
                </View>

                {!item.end_time && (
                    <View style={styles.activeBookingActions}>
                        <TouchableOpacity
                            style={styles.endButton}
                            onPress={() => handleEndBooking(item)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#ff6b6b', '#ee5a52']}
                                style={styles.endButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <MaterialIcons name="stop" size={20} color="#fff" />
                                <Text style={styles.endButtonText}>End Session</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <MaterialIcons name="history" size={64} color="#ccc" />
                <FarsiText style={styles.loadingText}>{t('messages.loadBooking')}</FarsiText>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons name="history" size={60} color="#fff" />
                </View>
                <FarsiText style={styles.title}>{t('messages.myBooking')}</FarsiText>
                <FarsiText style={styles.subtitle}>
                    {t('messages.track')}
                </FarsiText>
            </LinearGradient>

            {bookings.length === 0 ? (
                <ScrollView
                    contentContainerStyle={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <MaterialIcons name="event-busy" size={80} color="#ccc" />
                    <FarsiText style={styles.emptyText}>{t('messages.noBooking')}</FarsiText>
                    <FarsiText style={styles.emptySubtext}>
                        {t('messages.startCharge')}
                    </FarsiText>
                    <TouchableOpacity
                        style={styles.findChargersButton}
                        onPress={() => navigation.navigate('FindChargerLocationsScreenForCar', { user })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#43e97b', '#38f9d7']}
                            style={styles.findChargersGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <MaterialIcons name="search" size={20} color="#fff" />
                            <FarsiText style={styles.findChargersText}>{t('messages.chargerFinding')}</FarsiText>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <FlatList
                    data={bookings}
                    renderItem={renderBooking}
                    keyExtractor={(item) => item.booking_id?.toString() || Math.random().toString()}
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
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    listContainer: {
        padding: 20,
    },
    bookingCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    bookingIdContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookingId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 4,
    },
    bookingDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        minWidth: 80,
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    reviewContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginTop: 8,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    reviewText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
        fontStyle: 'italic',
    },
    activeBookingActions: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    endButton: {
        borderRadius: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    endButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    endButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
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
    findChargersButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    findChargersGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    findChargersText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
});
