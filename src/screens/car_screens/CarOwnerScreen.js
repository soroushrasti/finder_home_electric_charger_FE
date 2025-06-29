import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CarOwnerScreen({ navigation, user }) {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Car Owner'}!</Text>
                <Text style={styles.subtitle}>Ready for your next journey?</Text>
            </View>

            <View style={styles.quickActionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <TouchableOpacity
                    style={styles.primaryActionCard}
                    onPress={() => navigation.navigate('FindChargerLocations', { user })}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        style={styles.gradientCard}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.cardHeader}>
                            <MaterialIcons name="search" size={32} color="#fff" />
                            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                        </View>
                        <Text style={styles.primaryCardTitle}>Find Charging Stations</Text>
                        <Text style={styles.primaryCardSubtitle}>Discover nearby charging locations</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.secondaryActionsRow}>
                    <TouchableOpacity
                        style={styles.secondaryActionCard}
                        onPress={() => navigation.navigate('MyBookingsScreen', { user })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#4facfe', '#00f2fe']}
                            style={styles.smallGradientCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialIcons name="history" size={28} color="#fff" />
                            <Text style={styles.secondaryCardTitle}>My Bookings</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryActionCard}
                        onPress={() => navigation.navigate('MyCars', { user })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#43e97b', '#38f9d7']}
                            style={styles.smallGradientCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <MaterialIcons name="directions-car" size={28} color="#fff" />
                            <Text style={styles.secondaryCardTitle}>My Cars</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>Your Activity</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <MaterialIcons name="electric-bolt" size={24} color="#667eea" />
                        <Text style={styles.statNumber}>0</Text>
                        <Text style={styles.statLabel}>Charging Sessions</Text>
                    </View>
                    <View style={styles.statCard}>
                        <MaterialIcons name="attach-money" size={24} color="#43e97b" />
                        <Text style={styles.statNumber}>€0</Text>
                        <Text style={styles.statLabel}>Total Spent</Text>
                    </View>
                    <View style={styles.statCard}>
                        <MaterialIcons name="eco" size={24} color="#4facfe" />
                        <Text style={styles.statNumber}>0 kg</Text>
                        <Text style={styles.statLabel}>CO₂ Saved</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        padding: 24,
        paddingTop: 40,
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    quickActionsContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    primaryActionCard: {
        borderRadius: 16,
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    gradientCard: {
        padding: 24,
        borderRadius: 16,
        minHeight: 120,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryCardTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    primaryCardSubtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    secondaryActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    secondaryActionCard: {
        flex: 1,
        borderRadius: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    smallGradientCard: {
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        minHeight: 100,
        justifyContent: 'center',
    },
    secondaryCardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
        textAlign: 'center',
    },
    statsContainer: {
        padding: 20,
        paddingTop: 0,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});
