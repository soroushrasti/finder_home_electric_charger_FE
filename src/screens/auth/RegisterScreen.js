import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import env from '../../config/environment';

export default function RegisterScreen({ navigation }) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('Electric car owner');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !password) {
            Alert.alert('Missing Information', 'Please fill all fields to continue');
            return;
        }

        // if (password.length < 6) {
        //     Alert.alert('Weak Password', 'Password must be at least 6 characters long');
        //     return;
        // }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: firstName + ' ' + lastName,
                    first_name: firstName,
                    last_name: lastName,
                    email: email.toLowerCase(),
                    password,
                    user_type: userType,
                }),
            });

            if (response.ok) {
                Alert.alert(
                    'Welcome! 🎉',
                    'Your account has been created successfully. Please login to continue.',
                    [{ text: 'Login Now', onPress: () => navigation.navigate('Login') }]
                );
            } else {
                const errorData = await response.json();
                Alert.alert('Registration Failed', errorData.message || 'Please try again');
            }
        } catch (error) {
            Alert.alert('Network Error', 'Please check your connection and try again');
        } finally {
            setLoading(false);
        }
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
                    colors={['#667eea', '#764ba2']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="person-add" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join the electric future today</Text>
                </LinearGradient>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <MaterialIcons name="person" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                            placeholderTextColor="#999"
                            autoCapitalize="words"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                            placeholderTextColor="#999"
                            autoCapitalize="words"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="email" size={20} color="#667eea" style={styles.inputIcon} />
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
                        <MaterialIcons name="lock" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password (min. 6 characters)"
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

                    <View style={styles.pickerContainer}>
                        <MaterialIcons name="category" size={20} color="#667eea" style={styles.inputIcon} />
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={userType}
                                onValueChange={setUserType}
                                style={styles.picker}
                            >
                                <Picker.Item label="🚗 Electric Car Owner" value="Electric car owner" />
                                <Picker.Item label="🏠 Home Owner (Charger Host)" value="Home owner" />
                            </Picker>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#667eea', '#764ba2']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <MaterialIcons name="hourglass-empty" size={24} color="#fff" />
                            ) : (
                                <MaterialIcons name="person-add" size={24} color="#fff" />
                            )}
                            <Text style={styles.buttonText}>
                                {loading ? "Creating Account..." : "Create Account"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.loginPrompt}>
                        <Text style={styles.promptText}>Already have an account?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.featuresContainer}>
                    <Text style={styles.featuresTitle}>Why Join Us?</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="electric-bolt" size={20} color="#4285F4" />
                            <Text style={styles.featureText}>Find charging stations near you</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="attach-money" size={20} color="#34A853" />
                            <Text style={styles.featureText}>Earn money by sharing your charger</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <MaterialIcons name="eco" size={20} color="#FBBC04" />
                            <Text style={styles.featureText}>Support sustainable transportation</Text>
                        </View>
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
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 24,
        paddingLeft: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    pickerWrapper: {
        flex: 1,
    },
    picker: {
        height: 50,
        color: '#333',
    },
    registerButton: {
        borderRadius: 12,
        marginBottom: 24,
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
    loginPrompt: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    promptText: {
        fontSize: 16,
        color: '#666',
        marginRight: 8,
    },
    loginLink: {
        fontSize: 16,
        color: '#667eea',
        fontWeight: 'bold',
    },
    featuresContainer: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    featuresList: {
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 12,
        flex: 1,
    },
});
