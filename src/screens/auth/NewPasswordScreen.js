// src/screens/NewPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import env from '../../config/environment';

export default function NewPasswordScreen({ navigation, route }) {
    const { userId } = route.params;
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        if (!password || password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }

        return true;
    };

    const handleUpdatePassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/update-user/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`,
                },
                body: JSON.stringify({
                    password: password
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Success',
                    'Your password has been updated successfully. Please log in with your new password.',
                    [
                        {
                            text: 'Log In',
                            onPress: () => navigation.navigate('Login')
                        }
                    ]
                );
            } else {
                Alert.alert('Error', data.message || 'Failed to update password');
            }
        } catch (error) {
            console.error('Password update error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create New Password</Text>
            <Text style={styles.subtitle}>Please enter your new password</Text>

            <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleUpdatePassword}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Update Password</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        color: '#666',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 20,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4682B4',
        height: 50,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    }
});
