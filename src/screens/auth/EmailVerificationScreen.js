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
import FarsiText from  "../../components/FarsiText";

export default function EmailVerificationScreen({ navigation, route, setUser }) {
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
            Alert.alert('Error', 'Please enter the complete 5-digit verification code');
            return;
        }

        if (!user) {
            Alert.alert('Error', 'User information is missing. Please try registering again.');
            navigation.goBack();
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${env.apiUrl}/validate-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`,
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
                        Alert.alert('Success!', 'Email verified successfully! You are now logged in.');
                    }
                } else {
                    Alert.alert('Error', 'Email verification failed. Please try again.');
                }
            } else {
                if (response.status === 401) {
                    Alert.alert('Invalid Code', 'Please enter the correct verification code');
                    setVerificationCode(['', '', '', '', '']);
                    inputRefs.current[0]?.focus();
                } else {
                    Alert.alert('Error', data.message || 'Verification failed');
                }
            }
        } catch (error) {
            console.error('Verification error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!userId) {
            Alert.alert('Error', 'User information is missing. Please try registering again.');
            return;
        }

        setResendLoading(true);

        try {
            const response = await fetch(`${env.apiUrl}/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`,
                },
                body: JSON.stringify({
                    user_id: userId,
                    email: userEmail
                })
            });

            if (response.ok) {
                Alert.alert('Success', 'Verification code has been resent to your email');
                setVerificationCode(['', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                const data = await response.json();
                Alert.alert('Error', data.message || 'Failed to resend verification code');
            }
        } catch (error) {
            console.error('Resend error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
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
                        <Text style={styles.headerTitle}>Error</Text>
                        <Text style={styles.headerSubtitle}>
                            User information is missing. Please try registering again.
                        </Text>
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
                    <Text style={styles.headerTitle}>Verify Your Email</Text>
                    <Text style={styles.headerSubtitle}>
                        We've sent a verification code to {'\n'}
                        <Text style={styles.emailText}>{userEmail}</Text>
                    </Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.codeContainer}>
                    <Text style={styles.instructionText}>Enter the verification code</Text>

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
                        <Text style={styles.resendText}>
                            Didn't receive the code? {' '}
                            <Text style={styles.resendLink}>
                                {resendLoading ? 'Resending...' : 'Resend Code'}
                            </Text>
                        </Text>
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
                            <Text style={styles.verifyButtonText}>
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </Text>
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
