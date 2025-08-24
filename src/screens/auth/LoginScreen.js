import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Platform,
    ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";
import FarsiTextInput from  "../../components/FarsiTextInput";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


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
            Alert.alert(t('messages.error'), t('messages.fillingField'));
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
                    'X-API-Token': `${env.apiToken} `,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.is_validated_email) {
                setUser(data);
                // Save user data to AsyncStorage for persistent login
                await AsyncStorage.setItem('user', JSON.stringify(data));
                Alert.alert(
                    t('messages.welcome'),
                    t('messages.login'),
                    [
                        {
                            text: t('messages.continue'),
                            onPress: () => {
                                // Navigation will be handled by App.js based on user type
                            }
                        }
                    ]
                );
            } else if (response.ok && data.is_validated_email === false) {
                if (data.is_validated_email === false) {
                    Alert.alert(
                        t('messages.noVerifyEmail'),
                        t('messages.verifyEmail'),
                        [
                            {
                                text: t('messages.verifyResend'),
                                onPress: () => {
                                    navigation.navigate('EmailVerificationScreen', {
                                        user: data,
                                        isPasswordReset: false,
                                        setUser: setUser
                                    });
                                }
                            },
                            {
                                text: t('messages.cancel'),
                                style: 'cancel'
                            }
                        ]
                    );
                }
            }
            else {
                Alert.alert(t('messages.loginFail'), data.message || t('messages.invalidCredential'));
            }
        } catch (error) {
            console.error(t('messages.errorLogin'), error);
            Alert.alert(t('messages.error'), t('messages.networkError'));
        } finally {
            setLoading(false);
        }
    };

    const ScrollContainer = Platform.OS === 'web' ? ScrollView : KeyboardAwareScrollView;

    return (
        <ScrollContainer
            style={{ flex: 1, backgroundColor: '#fff' }}
            contentContainerStyle={{ flexGrow: 1, minHeight: Platform.OS === 'web' ? '100vh' : undefined, justifyContent: 'center', padding: 16 }}
            enableOnAndroid={true}
            extraScrollHeight={40}
            keyboardShouldPersistTaps="handled"
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
                    <FarsiText style={styles.headerTitle}>{t('messages.welcomeBackTitle')}</FarsiText>
                    <FarsiText style={styles.headerSubtitle}>{t('messages.signing')}</FarsiText>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <FarsiText style={styles.sectionTitle}> {t('messages.signIn')} 👋</FarsiText>

                    <View style={styles.inputGroup}>
                        <FarsiText style={styles.label}>{t('messages.email')}</FarsiText>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                            <FarsiTextInput
                                style={styles.input}
                                placeholder={t('messages.enterEmail')}
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <FarsiText style={styles.label}>{t('messages.pass')}</FarsiText>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="lock" size={20} color="#666" style={styles.inputIcon} />
                            <FarsiTextInput
                                style={styles.input}
                                placeholder= {t('messages.enterPassword')}
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                secureTextEntry={!showPassword}
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                style={styles.showPasswordIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.forgotPasswordButton}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <FarsiText style={styles.forgotPasswordText}>{t('messages.passForgot')}</FarsiText>
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
                            <FarsiText style={styles.loginButtonText}>
                                {loading ? t('messages.signingIn') : t('messages.signIn')}
                            </FarsiText>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerRedirectButton}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <FarsiText style={styles.registerRedirectText}>
                            {t('messages.noAccount')} <FarsiText style={styles.registerRedirectLink}>{t('messages.accountCreating')}</FarsiText>
                        </FarsiText>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollContainer>
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
        padding: 20,
    },
    formContainer: {
        paddingTop: 40,
        paddingBottom: 0, // Remove bottom padding completely
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
    showPasswordIcon: {
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
        marginTop: 10, // Reduce margin from 15 to 10
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
        paddingHorizontal: 20, // Add horizontal padding
        borderRadius: 12,
        minHeight: 56, // Ensure minimum height
    },
    loginButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 10, // Add specific margin instead of gap
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
