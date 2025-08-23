import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Switch
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";
import {useTranslation} from "react-i18next";
import FarsiText from  "../../components/FarsiText";
import FarsiTextInput from  "../../components/FarsiTextInput";


export default function FindChargerLocationsScreen({ navigation, route }) {
    const { t } = useTranslation();

    const { user } = route.params;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        post_code: '',
        alley: '',
        street: '',
        city: '',
        country: 'Iran', // Default country
        fast_charging: false
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSearch = async () => {
        // Validate required fields
        // if (!formData.city || !formData.street) {
        //     Alert.alert(t('messages.error'), t('messages.fill'));
        //     return;
        // }

        setLoading(true);

        try {
            const response = await fetch(`${env.apiUrl}/find-charging-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Token': `${env.apiToken} `,
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Navigate to ChargerLocationListScreen with search results
                navigation.navigate('ChargerLocationListScreenWithoutCar', {
                    user,
                    searchResults: data,
                    searchCriteria: formData
                });
            } else {
                Alert.alert(t('messages.error'), data.message || t('messages.failSearchLoc'));
            }
        } catch (error) {
            console.error(t('messages.searchError'), error);
            Alert.alert(t('messages.error'), t('messages.tryAgain'));
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            post_code: '',
            alley: '',
            street: '',
            city: '',
            country: '', // Default country
            fast_charging: false,
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#4CAF50', '#45a049']}
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
                    <MaterialIcons name="search" size={40} color="#fff" />
                    <Text style={styles.headerTitle}>{t('messages.findStation')}</Text>
                    <Text style={styles.headerSubtitle}>S{t('messages.searchLoc')}</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <FarsiText style={styles.sectionTitle}>📍 {t('messages.locDetail')}</FarsiText>
                    <View style={styles.inputGroup}>
                        <FarsiText style={styles.label}>{t('messages.country')}</FarsiText>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="public" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('messages.enterCountry')}
                                value={formData.country}
                                onChangeText={(value) => handleInputChange('country', value)}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <FarsiText style={styles.label}>{t('messages.city')}</FarsiText>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="location-city" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('messages.cityName')}
                                value={formData.city}
                                onChangeText={(value) => handleInputChange('city', value)}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <FarsiText style={styles.label}>{t('messages.street')}</FarsiText>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="directions" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('messages.streetName')}
                                value={formData.street}
                                onChangeText={(value) => handleInputChange('street', value)}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <FarsiText style={styles.label}>{t('messages.alley')}</FarsiText>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="near-me" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('messages.enterAlley')}
                                value={formData.alley}
                                onChangeText={(value) => handleInputChange('alley', value)}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <FarsiText style={styles.label}>{t('messages.postCode')}</FarsiText>
                        <View style={styles.inputContainer}>
                            <MaterialIcons name="markunread-mailbox" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('messages.enterCode')}
                                value={formData.post_code}
                                onChangeText={(value) => handleInputChange('post_code', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>



                    <FarsiText style={styles.sectionTitle}>{t('messages.chargingPre')}</FarsiText>

                    <View style={styles.switchContainer}>
                        <View style={styles.switchInfo}>
                            <MaterialIcons name="flash-on" size={24} color="#FF6B35" />
                            <View style={styles.switchTextContainer}>
                                <FarsiText style={styles.switchLabel}>{t('messages.fastCharging')}</FarsiText>
                                <FarsiText style={styles.switchSubtitle}>{t('messages.filterStation')}</FarsiText>
                            </View>
                        </View>
                        <Switch
                            value={formData.fast_charging}
                            onValueChange={(value) => handleInputChange('fast_charging', value)}
                            trackColor={{ false: '#767577', true: '#4CAF50' }}
                            thumbColor={formData.fast_charging ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearForm}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="clear" size={20} color="#666" />
                        <FarsiText style={styles.clearButtonText}>{t('messages.clear')}</FarsiText>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.searchButton, loading && styles.searchButtonDisabled]}
                        onPress={handleSearch}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#4CAF50', '#45a049']}
                            style={styles.searchButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons name="search" size={24} color="#fff" />
                            )}
                            <FarsiText style={styles.searchButtonText}>
                                {loading ? t('messages.searching') : t('messages.searchLocation')}
                            </FarsiText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 10,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        marginTop: 5,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    formContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
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
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    switchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    switchTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    switchSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    buttonContainer: {
        padding: 20,
        paddingBottom: 40,
        gap: 15,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        gap: 8,
    },
    clearButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    searchButton: {
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    searchButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    searchButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 12,
        gap: 10,
    },
    searchButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
});
