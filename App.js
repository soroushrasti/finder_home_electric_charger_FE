// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Button, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CarOwnerScreen from './src/screens/car_screens/CarOwnerScreen';
import HomeOwnerScreen from './src/screens/charger_screens/HomeOwnerScreen';
import React, { useState, useEffect } from 'react';
import AddCarScreen from './src/screens/car_screens/AddCarScreen';
import CarBookingsScreen from './src/screens/car_screens/CarBookingsScreen';
import FindChargerLocationsScreen from './src/screens/car_screens/FindChargerLocationsScreen';
import EndBookingScreen from "./src/screens/car_screens/EndBookingScreen";
import MyBookingsScreen from "./src/screens/car_screens/MyBookingsScreen";
import MyLocationBookingsScreen from './src/screens/charger_screens/MyLocationBookingsScreen';
import MyChargerLocationsScreen from './src/screens/charger_screens/MyChargerLocationsScreen';

const Stack = createStackNavigator();

function Home({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <MaterialIcons name="person-add" size={50} color="#4285F4" />
                <Button title="Register" onPress={() => navigation.navigate('Register')} />
            </View>

            <View style={styles.buttonContainer}>
                <MaterialIcons name="login" size={50} color="#0F9D58" />
                <Button title="Login" onPress={() => navigation.navigate('Login')} />
            </View>
        </View>
    );
}

export default function App() {
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        setUser(null);
    };

    const screenOptions = {
        headerRight: () => (
            <MaterialIcons
                name="logout"
                size={24}
                color="#007AFF"
                style={{ marginRight: 16 }}
                onPress={handleLogout}
            />
        ),
    };

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!user ? (
                    <>
                        <Stack.Screen name="Home" component={Home} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                        <Stack.Screen name="Login">
                            {props => <LoginScreen {...props} setUser={setUser} />}
                        </Stack.Screen>
                    </>
                ) : user.user_type === 'Electric car owner' ? (
                    <>
                        <Stack.Screen
                            name="CarOwner"
                            options={screenOptions}
                        >
                            {props => <CarOwnerScreen {...props} user={user} />}
                        </Stack.Screen>
                        <Stack.Screen name="AddCarScreen" component={AddCarScreen} options={screenOptions} />
                        <Stack.Screen name="MyBookingsScreen" component={MyBookingsScreen} options={screenOptions} />
                        <Stack.Screen name="CarBookings" component={CarBookingsScreen} options={screenOptions} />
                        <Stack.Screen name="ChargerLocations" component={FindChargerLocationsScreen} options={screenOptions} />
                        <Stack.Screen name="EndBooking" component={EndBookingScreen} options={screenOptions} />
                    </>
                ) : (
                    <>
                        <Stack.Screen
                            name="HomeOwner"
                            options={screenOptions}
                        >
                            {props => <HomeOwnerScreen {...props} user={user} />}
                        </Stack.Screen>
                        <Stack.Screen name="MyLocationBookings" component={MyLocationBookingsScreen} options={screenOptions} />
                        <Stack.Screen name="MyChargerLocations" component={MyChargerLocationsScreen} options={screenOptions} />

                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        alignItems: 'center',
        marginBottom: 30,
    }
});
