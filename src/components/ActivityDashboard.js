// src/components/ActivityDashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import env from '../config/environment';

const getActivityData = async (userId, userType = 'car_owner') => {
    try {
        const payload = userType === 'car_owner'
            ? { car_charger_owner_user_id: userId }
            : { charger_location_user_id: userId };

        const response = await fetch(`${env.apiUrl}/get-activity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                data: {
                    totalPrice: data.Total_price || 0,
                    numberBooking: data.Number_booking || 0,
                    numberLocations: data.Number_locations || 0
                }
            };
        } else {
            return { success: false, error: 'Failed to fetch activity data' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export default function ActivityDashboard({
                                              userId,
                                              userType = 'car_owner',
                                              onTotalEarningsPress,
                                              onActiveSessionsPress
                                          }) {
    const [activityData, setActivityData] = useState({
        totalPrice: 0,
        numberBooking: 0,
        numberLocations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchActivity();
        }
    }, [userId, userType]);

    const fetchActivity = async () => {
        try {
            const result = await getActivityData(userId, userType);
            if (result.success) {
                setActivityData(result.data);
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <MaterialIcons name="hourglass-empty" size={24} color="#666" />
                <Text style={styles.loadingText}>Loading activity...</Text>
            </View>
        );
    }

        return (
            <View style={styles.container}>
                <View style={styles.cardsContainer}>
                    <TouchableOpacity
                        style={styles.activityCard}
                        onPress={onTotalEarningsPress}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#e8f5e8' }]}>
                            <MaterialIcons name="attach-money" size={28} color="#4CAF50" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardValue}>€{activityData.totalPrice.toFixed(2)}</Text>
                            <Text style={styles.cardLabel}>
                                {userType === 'car_owner' ? 'Total Expenses' : 'Total Earnings'}
                            </Text>
                        </View>
                        <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.activityCard}
                        onPress={onActiveSessionsPress}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
                            <MaterialIcons name="history" size={28} color="#2196F3" />
                        </View>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardValue}>{activityData.numberBooking}</Text>
                            <Text style={styles.cardLabel}>Number of Bookings</Text>
                        </View>
                        <MaterialIcons name="arrow-forward-ios" size={16} color="#999" />
                    </TouchableOpacity>

                    {userType === 'location_owner' && (
                        <View style={styles.activityCard}>
                            <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
                                <MaterialIcons name="ev-station" size={28} color="#FF9800" />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardValue}>{activityData.numberLocations}</Text>
                                <Text style={styles.cardLabel}>Your Stations</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        );
    }

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        margin: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    cardsContainer: {
        gap: 12,
    },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 14,
        color: '#666',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 16,
        margin: 16,
    },
    loadingText: {
        marginLeft: 8,
        color: '#666',
        fontStyle: 'italic',
    },
});
