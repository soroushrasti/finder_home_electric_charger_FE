// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Button, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // Install if needed: npm install @expo/vector-icons
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CarOwnerScreen from './src/screens/CarOwnerScreen';
import HomeOwnerScreen from './src/screens/HomeOwnerScreen';

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
                ) : user.userType === 'ELECTRIC_CAR_OWNER' ? (
                    <Stack.Screen name="CarOwner">
                        {props => <CarOwnerScreen {...props} user={user} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="HomeOwner">
                        {props => <HomeOwnerScreen {...props} user={user} />}
                    </Stack.Screen>
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
