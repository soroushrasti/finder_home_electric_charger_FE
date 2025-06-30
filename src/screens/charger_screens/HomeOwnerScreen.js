import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeOwnerScreen({ navigation, user }) {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.iconContainer}>
                    <MaterialIcons name="home" size={60} color="#fff" />
                </View>
                <Text style={styles.title}>Welcome, {user?.first_name || 'Home Owner'}!</Text>
                <Text style={styles.subtitle}>
                    Manage your charging locations and track earnings
                </Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <LinearGradient
                            colors={['#4285F4', '#34A853']}
                            style={styles.statGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialIcons name="location-on" size={32} color="#fff" />
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Active Locations</Text>
                        </LinearGradient>
                    </View>
                    <View style={styles.statCard}>
                        <LinearGradient
                            colors={['#43e97b', '#38f9d7']}
                            style={styles.statGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialIcons name="attach-money" size={32} color="#fff" />
                            <Text style={styles.statNumber}>€0</Text>
                            <Text style={styles.statLabel}>Total Earnings</Text>
                        </LinearGradient>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('MyLocationBookings', { user })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <MaterialIcons name="list-alt" size={32} color="#667eea" />
                                </View>
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardTitle}>My Location Bookings</Text>
                                    <Text style={styles.cardSubtitle}>
                                        View all bookings at your charging stations
                                    </Text>
                                </View>
                                <MaterialIcons name="arrow-forward-ios" size={20} color="#667eea" />
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('MyChargerLocations', { user })}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View style={styles.cardIconContainer}>
                                    <MaterialIcons name="ev-station" size={32} color="#667eea" />
                                </View>
                                <View style={styles.cardTextContainer}>
                                    <Text style={styles.cardTitle}>My Charger Locations</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Manage and add new charging stations
                                    </Text>
                                </View>
                                <MaterialIcons name="arrow-forward-ios" size={20} color="#667eea" />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <MaterialIcons name="lightbulb" size={24} color="#ff9800" />
                        <Text style={styles.tipsTitle}>Quick Tips</Text>
                    </View>
                    <View style={styles.tipsList}>
                        <View style={styles.tipItem}>
                            <MaterialIcons name="check" size={16} color="#4CAF50" />
                            <Text style={styles.tipText}>Add charging locations to start earning</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <MaterialIcons name="check" size={16} color="#4CAF50" />
                            <Text style={styles.tipText}>Monitor bookings to optimize availability</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <MaterialIcons name="check" size={16} color="#4CAF50" />
                            <Text style={styles.tipText}>Provide clear directions for better reviews</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
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
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    scrollContainer: {
        padding: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    statGradient: {
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    menuContainer: {
        gap: 16,
        marginBottom: 24,
    },
    menuCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f0f4ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    tipsCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    tipsList: {
        gap: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
});
