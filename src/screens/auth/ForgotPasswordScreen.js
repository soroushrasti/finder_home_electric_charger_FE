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
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import FarsiText from  "../../components/FarsiText";


export default function ForgotPasswordScreen({ navigation }) {
    const { t, i18n } = useTranslation();
    const { isRTL } = useLanguage();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert(t('messages.error'), t('messages.emailAddress'));
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
                body: JSON.stringify({ email,
                    language: i18n.language === 'fa' ? 'Farsi' : 'English',
                })
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert(
                    t('messages.success'),
                    t('messages.emailVerifySend'),
                    [
                        {
                            text: t('messages.continue'),
                            onPress: () => {
                                navigation.navigate('EmailVerificationScreen', {
                                    user: data,
                                    isPasswordReset: true,
                                });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert(t('messages.error'), data.message || t('messages.failRequest'));
            }
        } catch (error) {
            console.error(t('messages.errorResetPass'), error);
            Alert.alert(t('messages.error'), t('messages.networkError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, isRTL && styles.rtl]}
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
                        <MaterialIcons name="lock-reset" size={60} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>{t('auth.resetPassword')}</Text>
                    <Text style={styles.headerSubtitle}>{t('messages.resetPassword')}</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}> {t('messages.passRecover')} 🔐</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('auth.email')}</Text>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder= {t('messages.enterEmail')}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <Text style={styles.infoText}>
                        {t('messages.verificationCode')}
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                        onPress={handleResetPassword}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#4facfe', '#00f2fe']}
                            style={styles.resetButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons name="send" size={24} color="#fff" />
                            )}
                            <Text style={styles.resetButtonText}>
                                {loading ? t('messages.sending') : t('auth.sendResetLink')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginRedirectButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginRedirectText}>
                            {t('auth.rememberPassword')} <Text style={styles.loginRedirectLink}>{t('auth.signIn')}</Text>
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
    rtl: {
        direction: 'rtl',
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
    infoText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
    },
    buttonContainer: {
        paddingBottom: 20,
    },
    resetButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 20,
    },
    resetButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    resetButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        gap: 10,
    },
    resetButtonText: {
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
        color: '#4facfe',
        fontWeight: 'bold',
    },
});
