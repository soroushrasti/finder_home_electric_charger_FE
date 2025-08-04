// src/screens/combined/CombinedDashboardScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FarsiText from  "../../components/FarsiText";
import FarsiTextInput from  "../../components/FarsiTextInput";

import {useTranslation} from "react-i18next";


export default function CombinedDashboardScreen({ navigation, user }) {
    const { t } = useTranslation();

    const carOwnerActions = [
        {
            title: 'Find Chargers',
            subtitle: 'Locate charging stations',
            icon: 'search',
            onPress: () => navigation.navigate('FindChargerLocationsScreen', { user }),
            colors: ['#43e97b', '#38f9d7']
        },
        {
            title: 'My Cars',
            subtitle: 'Manage your vehicles',
            icon: 'directions-car',
            onPress: () => navigation.navigate('MyCars', { user }),
            colors: ['#4facfe', '#00f2fe']
        },
        {
            title: 'My Bookings',
            subtitle: 'View charging history',
            icon: 'book-online',
            onPress: () => navigation.navigate('MyBookingsScreen', { user }),
            colors: ['#fa709a', '#fee140']
        }
    ];

    const homeOwnerActions = [
        {
            title: 'My Stations',
            subtitle: 'Manage charger locations',
            icon: 'ev-station',
            onPress: () => navigation.navigate('MyChargerLocations', { user }),
            colors: ['#667eea', '#764ba2']
        },
        {
            title: 'Add Station',
            subtitle: 'Share your charger',
            icon: 'add-location',
            onPress: () => navigation.navigate('ChargerLocationFormScreen',{ user }),
            colors: ['#f093fb', '#f5576c']
        },
        {
            title: 'Location Bookings',
            subtitle: 'Track your earnings',
            icon: 'monetization-on',
            onPress: () => navigation.navigate('MyLocationBookings',{ user }),
            colors: ['#ffecd2', '#fcb69f']
        }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="electric-bolt" size={40} color="#fff" />
                    </View>
                    <FarsiText style={styles.welcomeText}>{t('messages.welcome')}</FarsiText>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <FarsiText style={styles.userType}>{t('messages.bothProvider')}</FarsiText>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.section}>
                    <FarsiText style={styles.sectionTitle}>{t('messages.asCarOwner')}</FarsiText>
                    <View style={styles.actionsGrid}>
                        {carOwnerActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={action.onPress}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={action.colors}
                                    style={styles.actionGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <MaterialIcons name={action.icon} size={32} color="#fff" />
                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <FarsiText style={styles.sectionTitle}>{t('messages.asChargerProvider')}</FarsiText>
                    <View style={styles.actionsGrid}>
                        {homeOwnerActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.actionCard}
                                onPress={action.onPress}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={action.colors}
                                    style={styles.actionGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <MaterialIcons name={action.icon} size={32} color="#fff" />
                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
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
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    headerContent: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    userEmail: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginBottom: 4,
    },
    userType: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
    },
    content: {
        padding: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionCard: {
        width: '48%',
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginBottom: 12,
    },
    actionGradient: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 8,
        textAlign: 'center',
    },
    actionSubtitle: {
        fontSize: 12,
        color: '#fff',
        opacity: 0.9,
        marginTop: 4,
        textAlign: 'center',
    },
});
