import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';

export default function MyLocationBookingsScreen({ navigation, route }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const user = route.params?.user;

    useEffect(() => {
        if (user) {
            console.log('Fetching location bookings for user:', user.user_id);
            fetchLocationBookings();
        }
    }, [user]);

    const fetchLocationBookings = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,

                },
                body: JSON.stringify({
                    charger_location_owner_user_id: user.user_id,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);
                setBookings(data || []);
            } else {
                Alert.alert('Error', 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Network error:', error);
            Alert.alert('Network Error', 'Please check your connection and try again');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchLocationBookings();
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

    const renderBooking = ({ item }) => (
        <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
                <View style={styles.bookingIdContainer}>
                    <MaterialIcons name="confirmation-number" size={20} color="#667eea" />
                    <Text style={styles.bookingId}>#{item.booking_id}</Text>
                </View>
                {item.end_time ? (
                    <View style={styles.statusBadge}>
                        <MaterialIcons name="check-circle" size={16} color="#fff" />
                        <Text style={styles.statusText}>Completed</Text>
                    </View>
                ) : (
                    <View style={[styles.statusBadge, styles.activeBadge]}>
                        <MaterialIcons name="flash-on" size={16} color="#fff" />
                        <Text style={styles.statusText}>Active</Text>
                    </View>
                )}
            </View>

            <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                    <MaterialIcons name="directions-car" size={18} color="#666" />
                    <Text style={styles.detailLabel}>Car ID:</Text>
                    <Text style={styles.detailValue}>{item.car_id}</Text>
                </View>

                <View style={styles.detailRow}>
                    <MaterialIcons name="ev-station" size={18} color="#666" />
                    <Text style={styles.detailLabel}>Location ID:</Text>
                    <Text style={styles.detailValue}>{item.charging_location_id}</Text>
                </View>

                <View style={styles.detailRow}>
                    <MaterialIcons name="schedule" size={18} color="#666" />
                    <Text style={styles.detailLabel}>Started:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.start_time)}</Text>
                </View>

                {item.end_time && (
                    <View style={styles.detailRow}>
                        <MaterialIcons name="event-available" size={18} color="#666" />
                        <Text style={styles.detailLabel}>Ended:</Text>
                        <Text style={styles.detailValue}>{formatDate(item.end_time)}</Text>
                    </View>
                )}
            </View>

            {item.end_time && (
                <View style={styles.reviewSection}>
                    {item.review_rate && (
                        <View style={styles.ratingContainer}>
                            <MaterialIcons name="star" size={18} color="#FFD700" />
                            <Text style={styles.ratingLabel}>Customer Rating:</Text>
                            <View style={styles.starsContainer}>
                                {[...Array(5)].map((_, index) => (
                                    <MaterialIcons
                                        key={index}
                                        name={index < item.review_rate ? "star" : "star-border"}
                                        size={16}
                                        color={index < item.review_rate ? "#FFD700" : "#ddd"}
                                    />
                                ))}
                                <Text style={styles.ratingText}>({item.review_rate}/5)</Text>
                            </View>
                        </View>
                    )}

                    {item.review_message && (
                        <View style={styles.reviewMessageContainer}>
                            <MaterialIcons name="comment" size={18} color="#666" />
                            <Text style={styles.reviewMessage}>"{item.review_message}"</Text>
                        </View>
                    )}
                </View>
            )}

            {!item.end_time && (
                <View style={styles.activeIndicator}>
                    <MaterialIcons name="electric-bolt" size={20} color="#ff9800" />
                    <Text style={styles.activeText}>Customer is currently charging</Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centered}>
                <MaterialIcons name="ev-station" size={64} color="#ccc" />
                <Text style={styles.loadingText}>Loading location bookings...</Text>
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
                    <MaterialIcons name="business" size={60} color="#fff" />
                </View>
                <Text style={styles.title}>Location Bookings</Text>
                <Text style={styles.subtitle}>
                    Track all bookings at your charging stations
                </Text>
            </LinearGradient>

            {bookings.length === 0 ? (
                <ScrollView
                    contentContainerStyle={styles.emptyContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <MaterialIcons name="event-busy" size={80} color="#ccc" />
                    <Text style={styles.emptyText}>No bookings yet</Text>
                    <Text style={styles.emptySubtext}>
                        Your charging stations haven't been booked yet. Share your locations to attract customers!
                    </Text>
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
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeBadge: {
        backgroundColor: '#ff9800',
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
    reviewSection: {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    ratingLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        marginRight: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    reviewMessageContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    reviewMessage: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
        fontStyle: 'italic',
    },
    activeIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff8e1',
        marginHorizontal: -16,
        marginBottom: -16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    activeText: {
        color: '#ff9800',
        fontWeight: 'bold',
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
        lineHeight: 20,
    },
});
