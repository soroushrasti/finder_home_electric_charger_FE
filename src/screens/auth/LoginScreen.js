import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';

export default function LoginScreen({ navigation, setUser }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Information', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    password,
                }),
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                Alert.alert('Welcome Back! 👋', `Good to see you again, ${userData.first_name}`);
            } else {
                const errorData = await response.json();
                Alert.alert('Login Failed', errorData.message || 'Invalid email or password');
            }
        } catch (error) {
            Alert.alert('Network Error', 'Please check your connection and try again');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = (userType, demoEmail) => {
        setEmail(demoEmail);
        setPassword('123456');
        Alert.alert(
            'Demo Account',
            `Use this ${userType} account for testing:\nEmail: ${demoEmail}\nPassword: 123456`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Auto Login', onPress: () => {
                        setTimeout(() => handleLogin(), 500);
                    }}
            ]
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <LinearGradient
                    colors={['#4facfe', '#00f2fe']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="login" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue your electric journey</Text>
                </LinearGradient>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={20} color="#4facfe" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="lock" size={20} color="#4facfe" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            style={styles.eyeIcon}
                        >
                            <MaterialIcons
                                name={showPassword ? "visibility" : "visibility-off"}
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#4facfe', '#00f2fe']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <MaterialIcons name="hourglass-empty" size={24} color="#fff" />
                            ) : (
                                <MaterialIcons name="login" size={24} color="#fff" />
                            )}
                            <Text style={styles.buttonText}>
                                {loading ? "Signing In..." : "Sign In"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.forgotPassword}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.demoContainer}>
                        <Text style={styles.demoTitle}>🚀 Try Demo Accounts</Text>

                        <TouchableOpacity
                            style={styles.demoButton}
                            onPress={() => handleQuickLogin('Car Owner', 'carowner@demo.com')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.demoButtonContent}>
                                <MaterialIcons name="directions-car" size={24} color="#667eea" />
                                <View style={styles.demoTextContainer}>
                                    <Text style={styles.demoButtonTitle}>Car Owner Demo</Text>
                                    <Text style={styles.demoButtonSubtitle}>Find and book charging stations</Text>
                                </View>
                                <MaterialIcons name="arrow-forward" size={20} color="#667eea" />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.demoButton}
                            onPress={() => handleQuickLogin('Home Owner', 'homeowner@demo.com')}
                            activeOpacity={0.8}
                        >
                            <View style={styles.demoButtonContent}>
                                <MaterialIcons name="home" size={24} color="#43e97b" />
                                <View style={styles.demoTextContainer}>
                                    <Text style={styles.demoButtonTitle}>Home Owner Demo</Text>
                                    <Text style={styles.demoButtonSubtitle}>Share your charger and earn</Text>
                                </View>
                                <MaterialIcons name="arrow-forward" size={20} color="#43e97b" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.registerPrompt}>
                        <Text style={styles.promptText}>Don't have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.registerLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    scrollContainer: {
        flexGrow: 1,
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    formContainer: {
        padding: 24,
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 4,
    },
    loginButton: {
        borderRadius: 12,
        marginBottom: 16,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    forgotPassword: {
        alignItems: 'center',
        marginBottom: 24,
    },
    forgotText: {
        fontSize: 14,
        color: '#4facfe',
        fontWeight: '600',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 14,
        color: '#999',
        fontWeight: '600',
    },
    demoContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    demoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    demoButton: {
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    demoButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    demoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    demoButtonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    demoButtonSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    registerPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    promptText: {
        fontSize: 16,
        color: '#666',
        marginRight: 8,
    },
    registerLink: {
        fontSize: 16,
        color: '#4facfe',
        fontWeight: 'bold',
    },
});
