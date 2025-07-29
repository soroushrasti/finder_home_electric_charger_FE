import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ActivityDashboard from '../../components/ActivityDashboard';
import FarsiText from  "../../components/FarsiText";
import {useTranslation} from "react-i18next";


export default function HomeOwnerScreen({ navigation, user }) {
    const { t } = useTranslation();

    const handleTotalEarningsPress = () => {
        navigation.navigate('MyLocationBookingScreen', { user });
    };

    const handleActiveSessionsPress = () => {
        navigation.navigate('MyLocationBookingScreen', { user });
    };

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
                    {t('messages.manageLoc')}
                </Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Enhanced Menu Cards - Bigger and Fancier */}
                <View style={styles.menuContainer}>
                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('ChargerLocationFormScreen', { user })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#4CAF50', '#45a049']}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.enhancedCardContent}>
                                <View style={styles.enhancedIconContainer}>
                                    <MaterialIcons name="add-location" size={48} color="#fff" />
                                </View>
                                <Text style={styles.enhancedCardTitle}>{t('messages.addLoc')}</Text>
                                <Text style={styles.enhancedCardSubtitle}>
                                    {t('messages.registerStation')}
                                </Text>
                                <MaterialIcons name="arrow-forward" size={28} color="#fff" style={styles.cardArrow} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('MyBookingsScreen', { user })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#2196F3', '#1976D2']}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.enhancedCardContent}>
                                <View style={styles.enhancedIconContainer}>
                                    <MaterialIcons name="assignment" size={48} color="#fff" />
                                </View>
                                <Text style={styles.enhancedCardTitle}>{t('messages.locBooking')}</Text>
                                <Text style={styles.enhancedCardSubtitle}>
                                    {t('messages.viewBooking')}
                                </Text>
                                <MaterialIcons name="arrow-forward" size={28} color="#fff" style={styles.cardArrow} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuCard}
                        onPress={() => navigation.navigate('MyChargerLocationScreen', { user })}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FF9800', '#F57C00']}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.enhancedCardContent}>
                                <View style={styles.enhancedIconContainer}>
                                    <MaterialIcons name="ev-station" size={48} color="#fff" />
                                </View>
                                <Text style={styles.enhancedCardTitle}>{t('messages.myStation')}</Text>
                                <Text style={styles.enhancedCardSubtitle}>
                                    {t('messages.manageLocation')}
                                </Text>
                                <MaterialIcons name="arrow-forward" size={28} color="#fff" style={styles.cardArrow} />
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Activity Dashboard moved to bottom with better title */}
                <View style={styles.activitySection}>
                    <Text style={styles.sectionTitle}>📊 {t('messages.performanceOverview')}</Text>
                    <ActivityDashboard
                        userId={user?.user_id}
                        userType="location_owner"
                        onTotalEarningsPress={handleTotalEarningsPress}
                        onActiveSessionsPress={handleActiveSessionsPress}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerGradient: {
        padding: 40,
        paddingTop: 60,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    menuContainer: {
        padding: 16,
        gap: 20,
    },
    menuCard: {
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        marginHorizontal: 4,
    },
    cardGradient: {
        borderRadius: 20,
        padding: 24,
        minHeight: 140,
    },
    enhancedCardContent: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    enhancedIconContainer: {
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 25,
        padding: 12,
    },
    enhancedCardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    enhancedCardSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 20,
    },
    cardArrow: {
        position: 'absolute',
        top: 12,
        right: 12,
        opacity: 0.8,
    },
    activitySection: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
});
