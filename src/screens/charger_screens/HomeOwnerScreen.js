import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeOwnerScreen({ navigation, user }) {
    return (
        <View style={styles.container}>
            <Text style={styles.welcomeText}>Welcome, {user?.first_name || 'Home Owner'}!</Text>
            <Text style={styles.subtitle}>Manage your charging locations</Text>

            <View style={styles.menuContainer}>
                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={() => navigation.navigate('MyLocationBookings', { user })}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#4285F4', '#34A853']}
                        style={styles.gradientCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="list-alt" size={40} color="#fff" />
                        </View>
                        <Text style={styles.cardTitle}>My Booked Charger Locations</Text>
                        <Text style={styles.cardSubtitle}>View all bookings at your charging stations</Text>
                        <View style={styles.arrowContainer}>
                            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuCard}
                    onPress={() => navigation.navigate('MyChargerLocations', { user })}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#EA4335', '#FBBC04']}
                        style={styles.gradientCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="ev-station" size={40} color="#fff" />
                        </View>
                        <Text style={styles.cardTitle}>My Charger Locations</Text>
                        <Text style={styles.cardSubtitle}>Manage and add new charging stations</Text>
                        <View style={styles.arrowContainer}>
                            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <MaterialIcons name="location-on" size={24} color="#4285F4" />
                    <Text style={styles.statNumber}>0</Text>
                    <Text style={styles.statLabel}>Active Locations</Text>
                </View>
                <View style={styles.statCard}>
                    <MaterialIcons name="attach-money" size={24} color="#34A853" />
                    <Text style={styles.statNumber}>€0</Text>
                    <Text style={styles.statLabel}>Total Earnings</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    menuContainer: {
        flex: 1,
        justifyContent: 'center',
        gap: 20,
    },
    menuCard: {
        borderRadius: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradientCard: {
        padding: 24,
        borderRadius: 16,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    iconContainer: {
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 12,
    },
    arrowContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
});
