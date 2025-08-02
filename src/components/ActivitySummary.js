// components/ActivitySummary.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getActivityData } from '../services/activityService';

export default function ActivitySummary({
                                            userId,
                                            userType = 'car_owner',
                                            onEarningsPress,
                                            onSessionsPress,
                                            showRefresh = true
                                        }) {
    const [activityData, setActivityData] = useState({
        totalPrice: 0,
        numberBooking: 0,
        numberLocations: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchActivity();
        }
    }, [userId, userType]);

    const fetchActivity = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const result = await getActivityData(userId, userType);
            if (result.success) {
                setActivityData(result.data);
            }
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        fetchActivity(true);
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <View style={styles.loadingContainer}>
                    <MaterialIcons name="hourglass-empty" size={24} color="#666" />
                    <Text style={styles.loadingText}>{t('messages.loadActivity')}</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('messages.activityOverview')}</Text>
                {showRefresh && (
                    <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                        <MaterialIcons name="refresh" size={20} color="#4285F4" />
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.statsContainer}>
                <TouchableOpacity
                    style={styles.statCard}
                    onPress={onEarningsPress}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#e8f5e8' }]}>
                        <MaterialIcons name="attach-money" size={24} color="#4CAF50" />
                    </View>
                    <Text style={styles.statValue}>€{activityData.totalPrice.toFixed(2)}</Text>
                    <Text style={styles.statLabel}>Total Earnings</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#999" style={styles.arrowIcon} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.statCard}
                    onPress={onSessionsPress}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: '#e3f2fd' }]}>
                        <MaterialIcons name="history" size={24} color="#2196F3" />
                    </View>
                    <Text style={styles.statValue}>{activityData.numberBooking}</Text>
                    <Text style={styles.statLabel}>
                        {userType === 'car_owner' ? 'Charging Sessions' : 'Total Bookings'}
                    </Text>
                    <MaterialIcons name="arrow-forward" size={16} color="#999" style={styles.arrowIcon} />
                </TouchableOpacity>

                {userType === 'location_owner' && (
                    <View style={styles.statCard}>
                        <View style={[styles.iconContainer, { backgroundColor: '#fff3e0' }]}>
                            <MaterialIcons name="ev-station" size={24} color="#FF9800" />
                        </View>
                        <Text style={styles.statValue}>{activityData.numberLocations}</Text>
                        <Text style={styles.statLabel}>{t('messages.yourStation')}</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    refreshButton: {
        padding: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        position: 'relative',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: 16,
    },
    arrowIcon: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        marginLeft: 8,
        color: '#666',
        fontStyle: 'italic',
    },
});
