import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";

console.log('Environment config:', env);
console.log('API URL:', env.apiUrl);
export default function LoginScreen({ navigation, setUser }) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return false;
        }

        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(formData.email)) {
        //     Alert.alert('Error', 'Please enter a valid email address');
        //     return false;
        // }

        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await fetch(`${env.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.is_validated_email) {
                setUser(data);
            } else if (response.ok && data.is_validated_email === false) {
                if (data.is_validated_email === false) {
                    navigation.navigate('EmailVerificationScreen', {
                        user: data,
                        isPasswordReset: false,
                        setUser: setUser
                    });
                }
            }
            else {
                Alert.alert('Login Failed', data.message || 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={['#4facfe', '#00f2fe']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="login" size={60} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>{t('messages.welcomeBackTitle')}</Text>
                    <Text style={styles.headerSubtitle}>sign in to your account</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>👋 Sign In</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password *</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                secureTextEntry={!showPassword}
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeIcon}
                            >
                                <MaterialIcons
                                    name={showPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#4facfe', '#00f2fe']}
                            style={styles.loginButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons name="login" size={24} color="#fff" />
                            )}
                            <Text style={styles.loginButtonText}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerRedirectButton}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerRedirectText}>
                            Don't have an account? <Text style={styles.registerRedirectLink}>Create Account</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 1,
        padding: 8,
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    formContainer: {
        flex: 1,
        paddingTop: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 15,
        fontSize: 16,
        color: '#333',
    },
    eyeIcon: {
        padding: 5,
    },
    forgotPasswordButton: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#4facfe',
        fontWeight: '600',
    },
    buttonContainer: {
        paddingBottom: 20,
    },
    loginButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 20,
    },
    loginButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    loginButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        gap: 10,
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    registerRedirectButton: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    registerRedirectText: {
        fontSize: 16,
        color: '#666',
    },
    registerRedirectLink: {
        color: '#4facfe',
        fontWeight: 'bold',
    },
});
