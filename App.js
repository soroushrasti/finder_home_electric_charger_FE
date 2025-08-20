// App.js
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CarOwnerScreen from './src/screens/car_screens/CarOwnerScreen';
import HomeOwnerScreen from './src/screens/charger_screens/HomeOwnerScreen';
import React, { useState, useEffect } from 'react';
import AddCarScreen from './src/screens/car_screens/AddCarScreen';
import EditCarScreen from './src/screens/car_screens/EditCarScreen';
import CarBookingsScreen from './src/screens/car_screens/CarBookingsScreen';
import FindChargerLocationsScreenForCar from './src/screens/car_screens/FindChargerLocationsScreenForCar';
import EndBookingScreen from "./src/screens/car_screens/EndBookingScreen";
import MyBookingsScreen from "./src/screens/car_screens/MyBookingsScreen";
import MyChargerLocationsScreen from './src/screens/charger_screens/MyChargerLocationsScreen';
import ChargerLocationFormScreen from './src/screens/charger_screens/ChargerLocationFormScreen';
import EditChargerLocationScreen from './src/screens/charger_screens/EditChargerLocationScreen';
import MyCarsScreen from './src/screens/car_screens/MyCarsScreen';
import BookingConfirmationScreen from './src/screens/car_screens/BookingConfirmationScreen';
import ChargerLocationListScreen from './src/screens/car_screens/ChargerLocationListScreen';
import FindChargerLocationsScreen from './src/screens/car_screens/FindChargerLocationsScreen';
import ChargerLocationListScreenWithoutCar from './src/screens/car_screens/ChargerLocationListScreenWithoutCar';
import CarSelectionScreen from './src/screens/car_screens/CarSelectionScreen';
import EmailVerificationScreen from './src/screens/auth/EmailVerificationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CombinedDashboardScreen from './src/screens/combined/CombinedDashboardScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import NewPasswordScreen from './src/screens/auth/NewPasswordScreen';
import {LanguageProvider, useLanguage} from './src/context/LanguageContext';
import './src/localization/i18n';
import LanguageSwitcher from './src/components/LanguageSwitcher';
import {useTranslation} from "react-i18next";
import FinalizeLocationOnMapScreen from './src/screens/charger_screens/FinalizeLocationOnMapScreen';
import FarsiText from './src/components/FarsiText';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Stack = createStackNavigator();

function Home({ navigation }) {
    const { t } = useTranslation();
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.homeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.logoContainer}>
                    <View style={styles.iconWrapper}>
                        <MaterialIcons name="electric-bolt" size={80} color="#fff" />
                    </View>
                    <FarsiText style={styles.appTitle}>{t('messages.appTitle')}</FarsiText>
                    <FarsiText style={styles.appSubtitle}>{t('messages.appMessage')}</FarsiText>
                    <FarsiText style={styles.tagline}>{t('messages.notification')}</FarsiText>
                </View>
            </LinearGradient>

            <View style={styles.actionsContainer}>
                <FarsiText style={styles.sectionTitle}>{t('messages.start')}</FarsiText>

                <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => navigation.navigate('RegisterScreen')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#43e97b', '#38f9d7']}
                        style={styles.actionGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="person-add" size={32} color="#fff" />
                        <View style={styles.actionTextContainer}>
                            <FarsiText style={styles.actionText}>{t('messages.account')}</FarsiText>
                            <FarsiText style={styles.actionSubtext}>{t('messages.join')}</FarsiText>
                        </View>
                        <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryActionButton}
                    onPress={() => navigation.navigate('LoginScreen')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#4facfe', '#00f2fe']}
                        style={styles.actionGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <MaterialIcons name="login" size={32} color="#fff" />
                        <View style={styles.actionTextContainer}>
                            <FarsiText style={styles.actionText}>{t('messages.entry')}</FarsiText>
                            <FarsiText style={styles.actionSubtext}>{t('messages.welcomeBackTitle')}</FarsiText>
                        </View>
                        <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
                <FarsiText style={styles.featuresTitle}>{t('messages.doing')}</FarsiText>

                <View style={styles.featuresList}>
                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="search" size={28} color="#4285F4" />
                        </View>
                        <View style={styles.featureContent}>
                            <FarsiText style={styles.featureTitle}>{t('messages.chargerFinding')}</FarsiText>
                            <FarsiText style={styles.featureDescription}>
                                {t('messages.stationDiscovering')}
                            </FarsiText>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="attach-money" size={28} color="#34A853" />
                        </View>
                        <View style={styles.featureContent}>
                            <FarsiText style={styles.featureTitle}>{t('messages.moneyEarning')}</FarsiText>
                            <FarsiText style={styles.featureDescription}>
                                {t('messages.homeChargerShare')}
                            </FarsiText>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="eco" size={28} color="#FBBC04" />
                        </View>
                        <View style={styles.featureContent}>
                            <FarsiText style={styles.featureTitle}>{t('messages.green')}</FarsiText>
                            <FarsiText style={styles.featureDescription}>
                                {t('messages.supportTransportation')}
                            </FarsiText>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="people" size={28} color="#EA4335" />
                        </View>
                        <View style={styles.featureContent}>
                            <FarsiText style={styles.featureTitle}>{t('messages.community')}</FarsiText>
                            <FarsiText style={styles.featureDescription}>
                                {t('messages.EVOwnersConnecting')}
                            </FarsiText>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <FarsiText style={styles.statsTitle}>{t('messages.joining')}</FarsiText>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <FarsiText style={styles.statNumber}>1000+</FarsiText>
                        <FarsiText style={styles.statLabel}>{t('messages.chargingStation')}</FarsiText>
                    </View>
                    <View style={styles.statCard}>
                        <FarsiText style={styles.statNumber}>500+</FarsiText>
                        <FarsiText style={styles.statLabel}>{t('messages.happyUsers')}</FarsiText>
                    </View>
                    <View style={styles.statCard}>
                        <FarsiText style={styles.statNumber}>24/7</FarsiText>
                        <FarsiText style={styles.statLabel}>{t('messages.support')}</FarsiText>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

export default function App() {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const loadUserFromCache = async () => {
            try {
                const cachedUser = await AsyncStorage.getItem('user');
                if (cachedUser) {
                    setUser(JSON.parse(cachedUser));
                }
            } catch (e) {
                // Handle error if needed
            }
        };
        loadUserFromCache();
    }, []);
    const { t } = useTranslation();


    const handleLogout = () => {
        setUser(null);
    };

    const screenOptions = {
        headerStyle: {
            backgroundColor: '#667eea',
            elevation: 0,
            shadowOpacity: 0,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
        },
        headerRight: () => (
            <View style={styles.headerRightContainer}>
                <LanguageSwitcher />
                {user && (
                    <TouchableOpacity
                        onPress={handleLogout}
                        style={styles.logoutButton}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="logout" size={24} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>
        ),
    };

    // Helper function to determine user capabilities
    const getUserCapabilities = (user) => {
        if (!user) return { canUseCarFeatures: false, canUseChargerFeatures: false };

        const userType = user.user_type;

        if (userType === null) {
            // User can be both car owner and charger provider
            return { canUseCarFeatures: true, canUseChargerFeatures: true };
        } else if (userType === 'Electric car owner') {
            return { canUseCarFeatures: true, canUseChargerFeatures: false };
        } else {
            return { canUseCarFeatures: false, canUseChargerFeatures: true };
        }
    };

    const userCapabilities = getUserCapabilities(user);
    const getInitialRouteName = () => {
        if (!user) return "Home";

        // Determine the appropriate initial route based on user type
        if (user.user_type === null) {
            return "CombinedDashboardScreen"; // User can be both car owner and charger provider
        } else if (user.user_type === 'Electric car owner') {
            return "CarOwnerScreen"; // Electric car owner
        } else {
            return "HomeOwnerScreen"; // Charger provider
        }
    };
    return (
        <LanguageProvider>
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={getInitialRouteName()}
                screenOptions={screenOptions}
            >
                {!user ? (
                    <>
                        <Stack.Screen
                            name="Home"
                            options={{ title: t("messages.home") }}
                            component={Home}
                        />
                        <Stack.Screen
                            name="LoginScreen"
                            options={{ title: t("messages.logScreen") }}
                            children={props => <LoginScreen {...props} setUser={setUser} />}
                        />
                        <Stack.Screen
                            name="RegisterScreen"
                            options={{ title: t("messages.regScreen") }}
                            children={props => <RegisterScreen {...props} setUser={setUser} />}
                        />
                        <Stack.Screen
                            name="EmailVerificationScreen"
                            options={{ title: t("messages.emailScreen"),headerShown: false  }}
                        >
                            {props => <EmailVerificationScreen {...props} setUser={setUser} />}
                        </Stack.Screen>
                        <Stack.Screen
                            name="ForgotPassword"
                            options={{ title: t("messages.forgotPass"),headerShown: false }}
                            component={ForgotPasswordScreen}
                        />
                        <Stack.Screen
                            name="NewPassword"
                            options={{ title: t("messages.newPass"),headerShown: false  }}
                            component={NewPasswordScreen}
                        />
                    </>
                ) : (
                    <>
                        {/* Show appropriate dashboard based on user type */}
                        {user.user_type === null ? (
                            <Stack.Screen
                                name="CombinedDashboardScreen"
                                options={{ title: t("messages.dashboard") }}
                            >
                                {props => <CombinedDashboardScreen {...props} user={user} />}
                            </Stack.Screen>
                        ) : user.user_type === 'Electric car owner' ? (
                            <Stack.Screen
                                name="CarOwnerScreen"
                                options={{ title: t("messages.dashboard") }}
                            >
                                {props => <CarOwnerScreen {...props} user={user} />}
                            </Stack.Screen>
                        ) : (
                            <Stack.Screen
                                name="HomeOwnerScreen"
                                options={{ title: t("messages.dashboard") }}
                            >
                                {props => <HomeOwnerScreen {...props} user={user} />}
                            </Stack.Screen>
                        )}

                        {/* Car Owner Features - Show if user can use car features */}
                        {userCapabilities.canUseCarFeatures && (
                            <>
                                <Stack.Screen name="AddCar" component={AddCarScreen} options={{ title: t('messages.addVehicle') }} />
                                <Stack.Screen name="CarBookingsScreen" component={CarBookingsScreen} options={{ title: t('messages.myVehicle') }} />
                                <Stack.Screen name="EditCarScreen" component={EditCarScreen} options={{ title: t('messages.editVehicle') }} />
                                <Stack.Screen name="FindChargerLocationsScreenForCar" component={FindChargerLocationsScreenForCar} options={{ title: t('messages.findCharger') }} />
                                <Stack.Screen name="FindChargerLocationsScreen" component={FindChargerLocationsScreen} options={{ title: t('messages.chargerFinding') }} />
                                <Stack.Screen name="ChargerLocationListScreenWithoutCar" component={ChargerLocationListScreenWithoutCar} options={{ title: t('messages.listCharger') }} />
                                <Stack.Screen name="CarSelectionScreen" component={CarSelectionScreen} options={{ title: t('messages.carSelection') }} />
                                <Stack.Screen name="EndBooking" component={EndBookingScreen} options={{ title: t('messages.endCharging') }} />
                                <Stack.Screen name="MyCarsScreen" component={MyCarsScreen} options={{ title: t('messages.myCar') }} />
                                <Stack.Screen name="BookingConfirmationScreen" component={BookingConfirmationScreen} options={{ title: t('messages.confirmBooking') }} />
                                <Stack.Screen name="ChargerLocationListScreen" component={ChargerLocationListScreen} options={{ title: t('messages.locChargerList') }} />
                                <Stack.Screen name="MyBookingsScreen" component={MyBookingsScreen} options={{ title: t('messages.myBooking') }} />

                            </>
                        )}

                        {/* Charger Provider Features - Show if user can use charger features */}
                        {userCapabilities.canUseChargerFeatures && (
                            <>
                                <Stack.Screen name="FindChargerLocationsScreenForCar" component={FindChargerLocationsScreenForCar} options={{ title: t('messages.findCharger') }} />
                                <Stack.Screen name="MyBookingsScreen" component={MyBookingsScreen} options={{ title: t('messages.myBooking') }} />
                                <Stack.Screen name="MyChargerLocationScreen" component={MyChargerLocationsScreen} options={{ title: t('messages.myStation') }} />
                                <Stack.Screen name="ChargerLocationFormScreen" component={ChargerLocationFormScreen} options={{ title: t('messages.addStation') }} />
                                <Stack.Screen name="EditChargerLocationScreen" component={EditChargerLocationScreen} options={{ title: t('messages.editStation') }} />
                                <Stack.Screen name="FinalizeLocationOnMapScreen" component={FinalizeLocationOnMapScreen} options={{ title: t('messages.addStation')}} />
                                <Stack.Screen name="EndBooking" component={EndBookingScreen} options={{ title: t('messages.endCharging') }} />

                            </>
                        )}
                    </>
                )}
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ title: 'Settings' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
        </LanguageProvider>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    homeGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        minHeight: 400,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    iconWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    appTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    appSubtitle: {
        fontSize: 18,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.8,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    actionsContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    primaryActionButton: {
        borderRadius: 16,
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    secondaryActionButton: {
        borderRadius: 16,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    actionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        borderRadius: 16,
        minHeight: 80,
    },
    actionTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    actionText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    actionSubtext: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    featuresContainer: {
        padding: 20,
        paddingTop: 0,
    },
    featuresTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    featuresList: {
        gap: 12,
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        alignItems: 'center',
    },
    featureIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    statsContainer: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 24,
        borderRadius: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    statsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
        gap: 8,
    },
    logoutButton: {
        padding: 6,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});
