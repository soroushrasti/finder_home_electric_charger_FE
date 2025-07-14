import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";

export default function RegisterScreen({ navigation, setUser }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone_number: '',
        user_type: 'car_owner'
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const userTypes = [
        {
            id: 'car_owner',
            title: 'Electric Car Owner',
            description: 'Find and book charging stations',
            icon: 'directions-car',
            colors: ['#4facfe', '#00f2fe']
        },
        {
            id: 'home_owner',
            title: 'Charger Provider',
            description: 'Share your charging station',
            icon: 'ev-station',
            colors: ['#667eea', '#764ba2']
        },
        {
            id: 'both',
            title: 'Both',
            description: 'Car owner & charger provider',
            icon: 'electric-bolt',
            colors: ['#43e97b', '#38f9d7']
        }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password || !formData.phone_number) {
            Alert.alert('Error', 'Please fill in all required fields');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }

        if (formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Map the user type for API
            let apiUserType;
            if (formData.user_type === 'car_owner') {
                apiUserType = 'Electric car owner';
            } else if (formData.user_type === 'home_owner') {
                apiUserType = 'Charging station owner';
            } else {
                apiUserType = null; // Both types
            }

            const response = await fetch(`${env.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone_number: formData.phone_number,
                    user_type: apiUserType
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    'Registration Successful!',
                    'Please check your email for the verification code.',
                    [
                        {
                            text: 'Continue',
                            onPress: () => {
                                navigation.navigate('EmailVerificationScreen', {
                                    user: data,
                                    setUser: setUser
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Registration Failed', data.message || 'Please try again');
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                colors={['#667eea', '#764ba2']}
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
                        <MaterialIcons name="person-add" size={40} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Create Account</Text>
                    <Text style={styles.headerSubtitle}>Join our charging community</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name *</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address *</Text>
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
                        <Text style={styles.label}>Phone Number *</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="phone" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                value={formData.phone_number}
                                onChangeText={(value) => handleInputChange('phone_number', value)}
                                keyboardType="phone-pad"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Security</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password *</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Create a password"
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

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password *</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                secureTextEntry={!showConfirmPassword}
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={styles.eyeIcon}
                            >
                                <MaterialIcons
                                    name={showConfirmPassword ? "visibility" : "visibility-off"}
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Account Type</Text>

                    <View style={styles.userTypeContainer}>
                        <Text style={styles.userTypeLabel}>I am a:</Text>
                        <View style={styles.userTypeOptions}>
                            {userTypes.map((type) => (
                                <TouchableOpacity
                                    key={type.id}
                                    style={[
                                        styles.userTypeOption,
                                        formData.user_type === type.id && styles.userTypeOptionSelected
                                    ]}
                                    onPress={() => setFormData({ ...formData, user_type: type.id })}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={formData.user_type === type.id ? type.colors : ['#f8f9fa', '#e9ecef']}
                                        style={styles.userTypeGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <MaterialIcons
                                            name={type.icon}
                                            size={32}
                                            color={formData.user_type === type.id ? '#fff' : '#6c757d'}
                                        />
                                        <Text style={[
                                            styles.userTypeTitle,
                                            formData.user_type === type.id && styles.userTypeTextSelected
                                        ]}>
                                            {type.title}
                                        </Text>
                                        <Text style={[
                                            styles.userTypeDescription,
                                            formData.user_type === type.id && styles.userTypeDescriptionSelected
                                        ]}>
                                            {type.description}
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                            onPress={handleRegister}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={loading ? ['#ccc', '#999'] : ['#43e97b', '#38f9d7']}
                                style={styles.registerButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <MaterialIcons name="person-add" size={24} color="#fff" />
                                )}
                                <Text style={styles.registerButtonText}>
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.loginRedirectButton}
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.loginRedirectText}>
                                Already have an account? <Text style={styles.loginRedirectLink}>Sign In</Text>
                            </Text>
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
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
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
    },
    formContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        marginTop: 10,
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
    userTypeContainer: {
        marginBottom: 30,
    },
    userTypeLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    userTypeOptions: {
        gap: 12,
    },
    userTypeOption: {
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    userTypeOptionSelected: {
        elevation: 6,
        shadowOpacity: 0.2,
    },
    userTypeGradient: {
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        minHeight: 100,
        justifyContent: 'center',
    },
    userTypeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 8,
        textAlign: 'center',
    },
    userTypeTextSelected: {
        color: '#fff',
    },
    userTypeDescription: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    userTypeDescriptionSelected: {
        color: '#fff',
        opacity: 0.9,
    },
    buttonContainer: {
        paddingTop: 20,
        paddingBottom: 40,
    },
    registerButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 20,
    },
    registerButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    registerButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        gap: 10,
    },
    registerButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    loginRedirectButton: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    loginRedirectText: {
        fontSize: 16,
        color: '#666',
    },
    loginRedirectLink: {
        color: '#667eea',
        fontWeight: 'bold',
    },
});
