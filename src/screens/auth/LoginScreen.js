// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import env from '../../config/environment';

export default function LoginScreen({ navigation, setUser }) {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });

    const handleChange = (name, value) => {
        setCredentials({ ...credentials, [name]: value });
    };

    const handleLogin = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/user/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();
            if (response.ok) {
                setUser(data); // Store user data including userType
                Alert.alert('Success', 'Login successful!');
            } else {
                Alert.alert('Error', data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error details:', error.message);
            Alert.alert('Error', 'Network error during login');
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Username"
                onChangeText={v => handleChange('username', v)}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                onChangeText={v => handleChange('password', v)}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    input: { borderWidth: 1, marginBottom: 10, padding: 8, borderRadius: 4 },
});
