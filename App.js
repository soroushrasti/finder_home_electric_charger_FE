// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CarOwnerScreen from './src/screens/car_screens/CarOwnerScreen';
import HomeOwnerScreen from './src/screens/charger_screens/HomeOwnerScreen';
import React, { useState, useEffect } from 'react';
import AddCarScreen from './src/screens/car_screens/AddCarScreen';
import CarBookingsScreen from './src/screens/car_screens/CarBookingsScreen';
import FindChargerLocationsScreenForCar from './src/screens/car_screens/FindChargerLocationsScreenForCar';
import EndBookingScreen from "./src/screens/car_screens/EndBookingScreen";
import MyBookingsScreen from "./src/screens/car_screens/MyBookingsScreen";
import MyLocationBookingsScreen from './src/screens/charger_screens/MyLocationBookingsScreen';
import MyChargerLocationsScreen from './src/screens/charger_screens/MyChargerLocationsScreen';
import AddChargerLocationScreen from './src/screens/charger_screens/AddChargerLocationScreen';
import MyCarsScreen from './src/screens/car_screens/MyCarsScreen';
import BookingConfirmationScreen from './src/screens/car_screens/BookingConfirmationScreen';
import ChargerLocationListScreen from './src/screens/car_screens/ChargerLocationListScreen';
import FindChargerLocationsScreen from './src/screens/car_screens/FindChargerLocationsScreen';
import ChargerLocationListScreenWithoutCar from './src/screens/car_screens/ChargerLocationListScreenWithoutCar';
import CarSelectionScreen from './src/screens/car_screens/CarSelectionScreen';
import EmailVerificationScreen from './src/screens/auth/EmailVerificationScreen';
const Stack = createStackNavigator();
import CombinedDashboardScreen from './src/screens/combined/CombinedDashboardScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import NewPasswordScreen from './src/screens/auth/NewPasswordScreen';
import { LanguageProvider } from './src/context/LanguageContext';
import './src/localization/i18n';
import LanguageSwitcher from './src/components/LanguageSwitcher';



function Home({ navigation }) {
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
                    <Text style={styles.appTitle}>EV Charger</Text>
                    <Text style={styles.appSubtitle}>Your Electric Vehicle Companion</Text>
                    <Text style={styles.tagline}>Power your journey, share your charger</Text>
                </View>
            </LinearGradient>

            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Get Started</Text>

                <TouchableOpacity
                    style={styles.primaryActionButton}
                    onPress={() => navigation.navigate('Register')}
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
                            <Text style={styles.actionText}>Create Account</Text>
                            <Text style={styles.actionSubtext}>Join thousands of EV owners</Text>
                        </View>
                        <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryActionButton}
                    onPress={() => navigation.navigate('Login')}
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
                            <Text style={styles.actionText}>Sign In</Text>
                            <Text style={styles.actionSubtext}>Welcome back!</Text>
                        </View>
                        <MaterialIcons name="arrow-forward" size={24} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.featuresContainer}>
                <Text style={styles.featuresTitle}>What You Can Do</Text>

                <View style={styles.featuresList}>
                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="search" size={28} color="#4285F4" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Find Chargers</Text>
                            <Text style={styles.featureDescription}>
                                Discover charging stations near you with real-time availability
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="attach-money" size={28} color="#34A853" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Earn Money</Text>
                            <Text style={styles.featureDescription}>
                                Share your home charger and earn passive income
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="eco" size={28} color="#FBBC04" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Go Green</Text>
                            <Text style={styles.featureDescription}>
                                Support sustainable transportation and reduce emissions
                            </Text>
                        </View>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <MaterialIcons name="people" size={28} color="#EA4335" />
                        </View>
                        <View style={styles.featureContent}>
                            <Text style={styles.featureTitle}>Join Community</Text>
                            <Text style={styles.featureDescription}>
                                Connect with other EV owners and charging providers
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.statsTitle}>Join the Electric Revolution</Text>
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>1000+</Text>
                        <Text style={styles.statLabel}>Charging Stations</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>500+</Text>
                        <Text style={styles.statLabel}>Happy Users</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>24/7</Text>
                        <Text style={styles.statLabel}>Support</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

export default function App() {
    const [user, setUser] = useState(null);

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

    return (
        <LanguageProvider>
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home" screenOptions={screenOptions}>
                {!user ? (
                    <>
                        <Stack.Screen
                            name="Home"
                            component={Home}
                            options={{
                                headerShown: true,
                                title: 'EV Charger',
                                ...screenOptions
                            }}
                        />
                        <Stack.Screen
                            name="Register"
                            options={{ title: 'Create Account', headerShown: false }}
                        >
                            {props => <RegisterScreen {...props} setUser={setUser} />}
                        </Stack.Screen>
                        <Stack.Screen
                            name="EmailVerificationScreen"
                            options={{ headerShown: false }}
                        >
                            {props => <EmailVerificationScreen {...props} setUser={setUser} />}
                        </Stack.Screen>
                        <Stack.Screen
                            name="ForgotPassword"
                            component={ForgotPasswordScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="NewPassword"
                            component={NewPasswordScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="Login"
                            options={{ title: 'Sign In', headerShown: false }}
                        >
                            {props => <LoginScreen {...props} setUser={setUser} />}
                        </Stack.Screen>
                    </>
                ) : (
                    <>
                        {/* Show appropriate dashboard based on user type */}
                        {user.user_type === null ? (
                            <Stack.Screen
                                name="CombinedDashboardScreen"
                                options={{ title: 'Dashboard' }}
                            >
                                {props => <CombinedDashboardScreen {...props} user={user} />}
                            </Stack.Screen>
                        ) : user.user_type === 'Electric car owner' ? (
                            <Stack.Screen
                                name="CarOwnerScreen"
                                options={{ title: 'Dashboard' }}
                            >
                                {props => <CarOwnerScreen {...props} user={user} />}
                            </Stack.Screen>
                        ) : (
                            <Stack.Screen
                                name="HomeOwnerScreen"
                                options={{ title: 'Dashboard' }}
                            >
                                {props => <HomeOwnerScreen {...props} user={user} />}
                            </Stack.Screen>
                        )}

                        {/* Car Owner Features - Show if user can use car features */}
                        {userCapabilities.canUseCarFeatures && (
                            <>
                                <Stack.Screen name="AddCar" component={AddCarScreen} options={{ title: 'Add Vehicle' }} />
                                <Stack.Screen name="CarBookings" component={CarBookingsScreen} options={{ title: 'My Vehicles' }} />
                                <Stack.Screen name="FindChargerLocationsScreenForCar" component={FindChargerLocationsScreenForCar} options={{ title: 'Find Chargers for car' }} />
                                <Stack.Screen name="FindChargerLocationsScreen" component={FindChargerLocationsScreen} options={{ title: 'Find Chargers' }} />
                                <Stack.Screen name="ChargerLocationListScreenWithoutCar" component={ChargerLocationListScreenWithoutCar} options={{ title: 'List Chargers without car' }} />
                                <Stack.Screen name="CarSelectionScreen" component={CarSelectionScreen} options={{ title: 'Car selection after location' }} />
                                <Stack.Screen name="EndBooking" component={EndBookingScreen} options={{ title: 'End Charging' }} />
                                <Stack.Screen name="MyBookingsScreen" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
                                <Stack.Screen name="MyCars" component={MyCarsScreen} options={{ title: 'My Cars' }} />
                                <Stack.Screen name="BookingConfirmationScreen" component={BookingConfirmationScreen} options={{ title: 'Booking confirmation' }} />
                                <Stack.Screen name="ChargerLocationListScreen" component={ChargerLocationListScreen} options={{ title: 'Location charger list' }} />
                            </>
                        )}

                        {/* Charger Provider Features - Show if user can use charger features */}
                        {userCapabilities.canUseChargerFeatures && (
                            <>
                                <Stack.Screen name="MyLocationBookingScreen" component={MyLocationBookingsScreen} options={{ title: 'Location Bookings' }} />
                                <Stack.Screen name="MyChargerLocationScreen" component={MyChargerLocationsScreen} options={{ title: 'My Stations' }} />
                                <Stack.Screen name="AddChargerLocationScreen" component={AddChargerLocationScreen} options={{ title: 'Add Station' }} />
                            </>
                        )}
                    </>
                )}
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
