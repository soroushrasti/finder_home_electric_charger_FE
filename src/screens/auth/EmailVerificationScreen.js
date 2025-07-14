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

export default function EmailVerificationScreen({ navigation, route }) {
    const { user, userType } = route.params;
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const inputRefs = useRef([]);

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

        setLoading(true);

        try {
            const response = await fetch(`${env.apiUrl}/validate-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    email_verification_code: code
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.is_validated_email) {
                    Alert.alert(
                        'Success!',
                        'Email verified successfully! You are now logged in.',
                        [
                            {
                                text: 'Continue',
                                onPress: () => {
                                    if (data.user_type === 'Electric car owner') {
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'CarOwnerScreen', params: { user: data } }]
                                        });
                                    } else {
                                        navigation.reset({
                                            index: 0,
                                            routes: [{ name: 'HomeOwnerScreen', params: { user: data } }]
                                        });
                                    }
                                }
                            }
                        ]
                    );
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
        setResendLoading(true);

        try {
            const response = await fetch(`${env.apiUrl}/resend-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.user_id,
                    email: user.email
                })
            });

            if (response.ok) {
                Alert.alert('Success', 'Verification code has been resent to your email');
                setVerificationCode(['', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else {
                Alert.alert('Error', 'Failed to resend verification code');
            }
        } catch (error) {
            console.error('Resend error:', error);
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setResendLoading(false);
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
                        <MaterialIcons name="email" size={60} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Verify Your Email</Text>
                    <Text style={styles.headerSubtitle}>
                        We've sent a 5-digit code to{'\n'}
                        <Text style={styles.emailText}>{user.email}</Text>
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
                                ref={(ref) => inputRefs.current[index] = ref}
                                style={[
                                    styles.codeInput,
                                    digit ? styles.codeInputFilled : null
                                ]}
                                value={digit}
                                onChangeText={(value) => handleCodeChange(index, value)}
                                onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                                keyboardType="numeric"
                                maxLength={1}
                                textAlign="center"
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={styles.resendContainer}
                        onPress={handleResendCode}
                        disabled={resendLoading}
                    >
                        {resendLoading ? (
                            <ActivityIndicator size="small" color="#667eea" />
                        ) : (
                            <Text style={styles.resendText}>
                                Didn't receive the code? <Text style={styles.resendLink}>Resend</Text>
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.verifyButton,
                            (loading || verificationCode.join('').length !== 5) && styles.verifyButtonDisabled
                        ]}
                        onPress={handleVerifyCode}
                        disabled={loading || verificationCode.join('').length !== 5}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={
                                loading || verificationCode.join('').length !== 5
                                    ? ['#ccc', '#999']
                                    : ['#43e97b', '#38f9d7']
                            }
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
        marginBottom: 10,
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
        width: 45,
        height: 55,
        borderWidth: 2,
        borderColor: '#ddd',
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
    },
    codeInputFilled: {
        borderColor: '#667eea',
        backgroundColor: '#f8f9ff',
    },
    resendContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    resendText: {
        fontSize: 14,
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
