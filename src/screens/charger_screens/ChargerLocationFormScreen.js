import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FarsiText from  "../../components/FarsiText";
import {useTranslation} from "react-i18next";


export default function ChargerLocationFormScreen({ navigation, route }) {
    const { t } = useTranslation();

    const user = route.params?.user;
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        postcode: '',
        street: '',
        alley: '',
        phone_number: '',
        power_output: '',
        price_per_hour: '',
        description: '',
        fast_charging: false,
        user_id: user?.user_id || null
    });
    const [loading, setLoading] = useState(false);
    const handleNext = () => {
        if (!validateForm()) return;
        navigation.navigate('FinalizeLocationOnMapScreen', {
            formData,
            onLocationAdded // Pass this callback
        });
    };

    const onLocationAdded = route.params?.onLocationAdded;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const { name, city, postcode, street, phone_number, power_output, price_per_hour } = formData;

        if (!name.trim()) {
            Alert.alert(t('messages.validationError'), t('messages.stationName'));
            return false;
        }
        if (!city.trim()) {
            Alert.alert(t('messages.validationError'), t('messages.cityRequire'));
            return false;
        }
        if (!postcode.trim()) {
            Alert.alert(t('messages.validationError'), t('messages.postcodeRequire'));
            return false;
        }
        if (!street.trim()) {
            Alert.alert(t('messages.validationError'), t('messages.streetAddressRequire'));
            return false;
        }
        if (!phone_number.trim()) {
            Alert.alert(t('messages.validationError'), t('messages.phoneNumberRequire'));
            return false;
        }
        if (!power_output.trim()) {
            Alert.alert(t('messages.validationError'), t('messages.powerRequire'));
            return false;
        }
        if (!price_per_hour.trim()) {
            Alert.alert(t('messages.validationError'), t('messages.priceRequire'));
            return false;
        }

        // Validate phone number format
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone_number.replace(/\s/g, ''))) {
            Alert.alert(t('messages.validationError'), t('messages.validPhone'));
            return false;
        }

        // Validate power output is a number
        if (isNaN(parseFloat(power_output))) {
            Alert.alert(t('messages.validationError'), t('messages.validPower'));
            return false;
        }

        // Validate price is a number
        if (isNaN(parseFloat(price_per_hour))) {
            Alert.alert(t('messages.validationError'), t('messages.validPrice'));
            return false;
        }

        return true;
    };



    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="ev-station" size={50} color="#4285F4" />
                    </View>
                    <Text style={styles.title}>{t('messages.selectChargingStation')}</Text>
                    <Text style={styles.subtitle}>{t('messages.shareCharger')}</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="business" size={20} color="#4285F4" />
                        <Text style={styles.sectionTitle}>{t('messages.stationInfo')}</Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="location-on" size={20} color="#4285F4" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Station Name (e.g., Home Charger) *"
                            value={formData.name}
                            onChangeText={(value) => handleInputChange('name', value)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="place" size={20} color="#4285F4" />
                        <Text style={styles.sectionTitle}>{t('messages.locationDetail')}</Text>
                    </View>

                    <View style={styles.inputRow}>
                        <View style={[styles.inputContainer, styles.flexInput]}>
                            <MaterialIcons name="location-city" size={20} color="#4285F4" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="City *"
                                value={formData.city}
                                onChangeText={(value) => handleInputChange('city', value)}
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputContainer, styles.smallInput]}>
                            <MaterialIcons name="markunread-mailbox" size={20} color="#4285F4" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Postcode *"
                                value={formData.postcode}
                                onChangeText={(value) => handleInputChange('postcode', value)}
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="home" size={20} color="#4285F4" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Street Address *"
                            value={formData.street}
                            onChangeText={(value) => handleInputChange('street', value)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="place" size={20} color="#4285F4" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Alley/Lane (Optional)"
                            value={formData.alley}
                            onChangeText={(value) => handleInputChange('alley', value)}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="phone" size={20} color="#4285F4" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number *"
                            value={formData.phone_number}
                            onChangeText={(value) => handleInputChange('phone_number', value)}
                            keyboardType="phone-pad"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.sectionHeader}>
                        <MaterialIcons name="flash-on" size={20} color="#4285F4" />
                        <Text style={styles.sectionTitle}>{t('messages.technical')}</Text>
                    </View>

                    <View style={styles.inputRow}>
                        <View style={[styles.inputContainer, styles.halfInput]}>
                            <MaterialIcons name="flash-on" size={20} color="#4285F4" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Power (kW) *"
                                value={formData.power_output}
                                onChangeText={(value) => handleInputChange('power_output', value)}
                                keyboardType="decimal-pad"
                                placeholderTextColor="#999"
                            />
                        </View>

                        <View style={[styles.inputContainer, styles.halfInput]}>
                            <MaterialIcons name="attach-money" size={20} color="#4285F4" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="€/hour *"
                                value={formData.price_per_hour}
                                onChangeText={(value) => handleInputChange('price_per_hour', value)}
                                keyboardType="decimal-pad"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.switchContainer}>
                        <View style={styles.switchInfo}>
                            <MaterialIcons name="speed" size={24} color="#4285F4" />
                            <View style={styles.switchTextContainer}>
                                <Text style={styles.switchLabel}>{t('messages.fastCharging')}</Text>
                                <Text style={styles.switchDescription}>
                                    {('messages.enableDc')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={formData.fast_charging}
                            onValueChange={(value) => handleInputChange('fast_charging', value)}
                            trackColor={{ false: '#ccc', true: '#4285F4' }}
                            thumbColor={formData.fast_charging ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="description" size={20} color="#4285F4" style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, styles.multilineInput]}
                            placeholder={t('messages.description')}
                            value={formData.description}
                            onChangeText={(value) => handleInputChange('description', value)}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleNext}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#4285F4', '#34A853']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <MaterialIcons name="hourglass-empty" size={24} color="#fff" />
                            ) : (
                                <MaterialIcons name="add-location" size={24} color="#fff" />
                            )}
                            <Text style={styles.buttonText}>
                                {loading ? "Adding Station..." : "Add Charging Station"}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.benefitsCard}>
                    <Text style={styles.benefitsTitle}>💡 {t('messages.benefits')}</Text>
                    <View style={styles.benefitsList}>
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="attach-money" size={16} color="#34A853" />
                            <Text style={styles.benefitText}>{t('messages.earnIncome')}</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="eco" size={16} color="#34A853" />
                            <Text style={styles.benefitText}>{t('messages.supportTransport')}</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <MaterialIcons name="people" size={16} color="#34A853" />
                            <Text style={styles.benefitText}>{t('messages.helpCommunity')}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.noteContainer}>
                    <MaterialIcons name="info" size={20} color="#ff9800" />
                    <Text style={styles.noteText}>
                        {t('messages.requiredField')}
                    </Text>
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
        alignItems: 'center',
        padding: 24,
        paddingTop: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e3f2fd',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    flexInput: {
        flex: 2,
    },
    smallInput: {
        flex: 1,
    },
    inputIcon: {
        marginRight: 12,
        marginTop: 16,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    multilineInput: {
        paddingTop: 16,
        paddingBottom: 16,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        marginBottom: 2,
    },
    switchDescription: {
        fontSize: 12,
        color: '#666',
    },
    addButton: {
        borderRadius: 12,
        marginTop: 8,
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
    benefitsCard: {
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
    benefitsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    benefitsList: {
        gap: 8,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    benefitText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
    },
    noteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        margin: 20,
        marginTop: 0,
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ff9800',
    },
    noteText: {
        fontSize: 12,
        color: '#856404',
        marginLeft: 12,
        flex: 1,
        lineHeight: 16,
    },
});
