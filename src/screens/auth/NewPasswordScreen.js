import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from '../../config/environment';
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";
import FarsiTextInput from  "../../components/FarsiTextInput";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function NewPasswordScreen({ navigation, route }) {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { userId } = route.params || {};

    const validatePassword = () => {
        if (!password.trim()) {
            Alert.alert(t('messages.error'), t('messages.enterPassword'));
            return false;
        }
        if (password.length < 6) {
            Alert.alert(t('messages.error'), t('messages.PassChar'));
            return false;
        }
        return true;
    };

    const handleNewPassword = async () => {
        if (!validatePassword()) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/update-user/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Token': `${env.apiToken}`,
                },
                body: JSON.stringify({
                    password: password
                }),
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert(
                    t('messages.success'),
                    t('messages.updatePassword'),
                    [
                        {
                            text: t('messages.logIn'),
                            onPress: () => navigation.navigate('LoginScreen')
                        }
                    ]
                );
            } else {
                Alert.alert(t('messages.error'), data.message || t('messages.updatePassFail'));
            }
        } catch (error) {
            console.error(t('messages.errorUpdatePass'), error);
            Alert.alert(t('messages.error'), t('messages.networkError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            enableOnAndroid={true}
            extraScrollHeight={40}
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
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
                        <MaterialIcons name="lock-outline" size={60} color="#fff" />
                    </View>
                    <FarsiText style={styles.headerTitle}>{t('messages.newPass')}</FarsiText>
                    <FarsiText style={styles.headerSubtitle}>{t('messages.setPass')}</FarsiText>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.formContainer}>
                    <FarsiText style={styles.sectionTitle}>🔒 {t('messages.createPass')}</FarsiText>

                    <View style={styles.inputGroup}>
                        <FarsiText style={styles.label}>{t('messages.newPass')}</FarsiText>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="vpn-key" size={20} color="#666" style={styles.inputIcon} />
                            <FarsiTextInput
                                style={styles.input}
                                placeholder= {t('messages.enterPassword')}
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.togglePasswordVisibility}
                            >
                                <MaterialIcons name={showPassword ? "visibility" : "visibility-off"} size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                        onPress={handleNewPassword}
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
                            <FarsiText style={styles.resetButtonText}>
                                {loading ? t('messages.update'): t('messages.updatePass')}
                            </FarsiText>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.loginRedirectButton}
                        onPress={() => navigation.navigate('LoginScreen')}
                    >
                        <FarsiText style={styles.loginRedirectText}>
                            {t('messages.back')} <FarsiText style={styles.loginRedirectLink}>{t('messages.signIn')}</FarsiText>
                        </FarsiText>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        // Web-specific styles
        ...(Platform.OS === 'web' && {
            minHeight: '100vh',
            width: '100%'
        })
    },
    header: {
        paddingTop: Platform.OS === 'web' ? 40 : 60,
        paddingBottom: 40,
        paddingHorizontal: 20,
        position: 'relative'
    },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 40 : 60,
        left: 20,
        zIndex: 1,
        padding: 8,
        borderRadius: 20,
        // Web hover effect
        ...(Platform.OS === 'web' && {
            cursor: 'pointer'
        })
    },
    headerContent: {
        alignItems: 'center',
        marginTop: 20
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    headerTitle: {
        fontSize: Platform.OS === 'web' ? 32 : 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
        // Web font fallback
        ...(Platform.OS === 'web' && {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        })
    },
    headerSubtitle: {
        fontSize: Platform.OS === 'web' ? 18 : 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
        // Web font fallback
        ...(Platform.OS === 'web' && {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        })
    },
    content: {
        flex: 1,
        padding: 20,
        minHeight: 400,
        // Web-specific max width for better UX
        ...(Platform.OS === 'web' && {
            maxWidth: 600,
            alignSelf: 'center',
            width: '100%'
        })
    },
    formContainer: {
        paddingTop: 40,
        paddingBottom: 40
    },
    sectionTitle: {
        fontSize: Platform.OS === 'web' ? 20 : 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 30,
        textAlign: 'center',
        // Web font fallback
        ...(Platform.OS === 'web' && {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        })
    },
    inputGroup: {
        marginBottom: 20
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        // Web font fallback
        ...(Platform.OS === 'web' && {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        })
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        // Platform-specific shadows
        ...(Platform.OS === 'android' && {
            elevation: 2
        }),
        ...(Platform.OS === 'ios' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2
        }),
        ...(Platform.OS === 'web' && {
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e0e0e0'
        })
    },
    inputIcon: {
        marginRight: 10
    },
    input: {
        flex: 1,
        paddingVertical: Platform.OS === 'web' ? 12 : 15,
        fontSize: 16,
        color: '#333',
        // Web-specific styles
        ...(Platform.OS === 'web' && {
            outline: 'none',
            border: 'none',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        })
    },
    togglePasswordVisibility: {
        padding: 8,
        borderRadius: 20,
        // Web hover effect
        ...(Platform.OS === 'web' && {
            cursor: 'pointer'
        })
    },
    buttonContainer: {
        paddingBottom: Platform.OS === 'web' ? 40 : 20
    },
    resetButton: {
        borderRadius: 12,
        marginBottom: 20,
        // Platform-specific shadows
        ...(Platform.OS === 'android' && {
            elevation: 4
        }),
        ...(Platform.OS === 'ios' && {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4
        }),
        ...(Platform.OS === 'web' && {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer'
        })
    },
    resetButtonDisabled: {
        // Platform-specific disabled styles
        ...(Platform.OS === 'android' && {
            elevation: 0
        }),
        ...(Platform.OS === 'ios' && {
            shadowOpacity: 0
        }),
        ...(Platform.OS === 'web' && {
            boxShadow: 'none',
            cursor: 'not-allowed'
        })
    },
    resetButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Platform.OS === 'web' ? 16 : 18,
        paddingHorizontal: 20,
        borderRadius: 12,
        minHeight: 56,
        // Web flexbox gap fallback
        ...(Platform.OS === 'web' ? {} : { gap: 10 })
    },
    resetButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: Platform.OS === 'web' ? 10 : 0,
        // Web font fallback
        ...(Platform.OS === 'web' && {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        })
    },
    loginRedirectButton: {
        alignItems: 'center',
        paddingVertical: 15,
        borderRadius: 8,
        // Web hover effect
        ...(Platform.OS === 'web' && {
            cursor: 'pointer'
        })
    },
    loginRedirectText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        // Web font fallback
        ...(Platform.OS === 'web' && {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        })
    },
    loginRedirectLink: {
        color: '#4facfe',
        fontWeight: 'bold',
        // Web font fallback
        ...(Platform.OS === 'web' && {
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        })
    }
});
