// src/screens/ForgotPasswordScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import env from '../../config/environment';

export default function ForgotPasswordScreen({ navigation, setUser }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/user-forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`,
                },
                body: JSON.stringify({
                    email: email
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Success',
                    'A verification code has been sent to your email',
                    [
                        {
                            text: 'Continue',
                            onPress: () => {
                                navigation.navigate('EmailVerificationScreen', {
                                    user: data,
                                    isPasswordReset: true,
                                    setUser: setUser
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', data.message || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
                Enter your email address and we'll send you a verification code
            </Text>

            <TextInput
                style={styles.input}
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Send Verification Code</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>Back to Login</Text>
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
    },
    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#4682B4',
        fontSize: 16,
    },
});
