import React, { useState, useRef } from 'react';
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
import FarsiTextInput from  "../../components/FarsiTextInput";
import FarsiText from  "../../components/FarsiText";


export default function EmailVerificationScreen({ navigation, route, setUser }) {
    const { t, i18n } = useTranslation();
    const { user, isPasswordReset } = route.params || {};
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const inputRefs = useRef([]);

    // Add null checks for user data
    const userEmail = user?.email || '';
    const userId = user?.user_id || null;

    const handleCodeChange = (index, value) => {
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (index, key) => {
        if (key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyCode = async () => {
        const code = verificationCode.join('');

        if (code.length !== 5) {
            Alert.alert(t('messages.error'), t('messages.enter5DigitCode'));
            return;
        }

        if (!user) {
            Alert.alert(t('messages.error'), t('messages.registerInfo'));
            navigation.goBack();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${env.apiUrl}/validate-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Token': `${env.apiToken}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    email_verification_code: code
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.is_validated_email) {
                    if (isPasswordReset) {
                        // For password reset flow
                        navigation.navigate('NewPassword', { userId: userId || data.user_id });
                    } else {
                        // For normal registration flow
                        setUser(data);
                        Alert.alert(t('messages.success') , t('messages.emailLoggIn'));
                    }
                } else {
                    Alert.alert(t('messages.error'), t('messages.emailFail'));
                }
            } else {
                if (response.status === 401) {
                    Alert.alert(t('messages.invalidCode'), t('messages.correctCode'));
                    setVerificationCode(['', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                } else {
                    Alert.alert(t('messages.error'), data.message || t('messages.failVerify'));
                }
            }
        } catch (error) {
            console.error(t('messages.errorVerify'), error);
            Alert.alert(t('messages.error'), t('messages.networkError'));
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!userId) {
            Alert.alert(t('messages.error'), t('messages.registerInfo'));
            return;
        }

        setResendLoading(true);

        try {
            const response = await fetch(`${env.apiUrl}/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Token': `${env.apiToken}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    email: userEmail,
                    language: i18n.language === 'fa' ? 'Farsi' : 'English', // Map language code to your API format
                })
            });

            if (response.ok) {
                Alert.alert(t('messages.success'), t('messages.resendVerify'));
                setVerificationCode(['', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                const data = await response.json();
                Alert.alert(t('messages.error'), data.message || t('messages.resendVerifyError'));
            }
        } catch (error) {
            console.error(t('messages.errorResending'), error);
            Alert.alert(t('messages.error'), t('messages.networkError'));
        } finally {
            setResendLoading(false);
        }
    };

    // Early return if user data is missing
    if (!user || !userEmail) {
        return (
            <View style={styles.container}>
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
                            <MaterialIcons name="error" size={40} color="#fff" />
                        </View>
                        <FarsiText style={styles.headerTitle}>{t('messages.error')}</FarsiText>
                        <FarsiText style={styles.headerSubtitle}>
                            {t('messages.registerInfo')}
                        </FarsiText>
                    </View>
                </LinearGradient>
            </View>
        );
    }

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
                        <MaterialIcons name="mark-email-read" size={40} color="#fff" />
                    </View>
                    <FarsiText style={styles.headerTitle}>{t('messages.emailVerify')}</FarsiText>
                    <FarsiText style={styles.headerSubtitle}>
                        {t('messages.sendingVerify')} {'\n'}
                        <Text style={styles.emailText}>{userEmail}</Text>
                    </FarsiText>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.codeContainer}>
                    <FarsiText style={styles.instructionText}>{t('messages.enterVerify')}</FarsiText>

                    <View style={styles.codeInputContainer}>
                        {verificationCode.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={ref => inputRefs.current[index] = ref}
                                style={[
                                    styles.codeInput,
                                    digit && styles.codeInputFilled
                                ]}
                                value={digit}
                                onChangeText={(value) => handleCodeChange(index, value)}
                                onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                autoFocus={index === 0}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.resendContainer}
                        onPress={handleResendCode}
                        disabled={resendLoading}
                    >
                        <FarsiText style={styles.resendText}>
                            {t('messages.noCode')} {' '}
                            <FarsiText style={styles.resendLink}>
                                {resendLoading ? t('messages.resending') : t('messages.resend')}
                            </FarsiText>
                        </FarsiText>
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
                        onPress={handleVerifyCode}
                        disabled={loading || verificationCode.join('').length !== 5}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#43e97b', '#38f9d7']}
                            style={styles.verifyButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons name="verified" size={24} color="#fff" />
                            )}
                            <FarsiText style={styles.verifyButtonText}>
                                {loading ? t('messages.verify') : t('messages.emailVerifying')}
                            </FarsiText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
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
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
        lineHeight: 24,
    },
    emailText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    content: {
        flex: 1,
        padding: 20,
        justifyContent: 'space-between',
    },
    codeContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    instructionText: {
        fontSize: 18,
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
        fontWeight: '600',
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 30,
    },
    codeInput: {
        width: 50,
        height: 60,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        borderRadius: 12,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        backgroundColor: '#fff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        textAlign: 'center',
    },
    codeInputFilled: {
        borderColor: '#667eea',
        backgroundColor: '#f8f9ff',
    },
    resendContainer: {
        alignItems: 'center',
        paddingVertical: 15,
    },
    resendText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    resendLink: {
        color: '#667eea',
        fontWeight: 'bold',
    },
    buttonContainer: {
        paddingBottom: 20,
    },
    verifyButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    verifyButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    verifyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        gap: 10,
    },
    verifyButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});
