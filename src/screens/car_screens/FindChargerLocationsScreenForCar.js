import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Switch, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";
import FarsiText from  "../../components/FarsiText";
import { useTranslation } from 'react-i18next';
import FarsiTextInput from  "../../components/FarsiTextInput";


export default function FindChargerLocationsScreenForCar({ navigation, route }) {
    const { t } = useTranslation();

    const [postCode, setPostCode] = useState(null);
    const [alley, setAlley] = useState(null);
    const [street, setStreet] = useState(null);
    const [homePhone, setHomePhone] = useState(null);
    const [city, setCity] = useState(null);
    const [fastCharging, setFastCharging] = useState(false);
    const [loading, setLoading] = useState(false);

    const { car, user } = route.params;

    const handleSearch = async () => {
        if (!postCode || !street || !city) {
            Alert.alert(t('messages.missingInformation'), t('messages.fillField'));
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/find-charging-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken} `,
                },
                body: JSON.stringify({
                    post_code: postCode,
                    alley,
                    street,
                    home_phone_number: homePhone,
                    city,
                    fast_charging: fastCharging,
                }),
            });

            // In the handleSearch function, replace the navigation call:
            if (response.ok) {
                const chargingLocations = await response.json();
                if (!chargingLocations || chargingLocations.length === 0) {
                    Alert.alert(t('messages.noResult'), t('messages.noCharging'));
                    return;
                }
                navigation.navigate('ChargerLocationListScreen', {
                    car,
                    user,
                    chargingLocations,
                    searchCriteria: {
                        post_code: postCode,
                        city,
                        fast_charging: fastCharging
                    }
                });
            } else {
                Alert.alert(t('messages.searchFail'), t('messages.noChargingLocation'));
            }
        } catch (error) {
            Alert.alert(t('messages.NetError'), t('messages.checkConnection'));
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
                        <MaterialIcons name="search" size={60} color="#fff" />
                    </View>
                    <Text style={styles.title}>{t('messages.findStation')}</Text>
                    <Text style={styles.subtitle}>
                        {t('messages.searchNearLoc')}
                    </Text>
                </LinearGradient>

                <View style={styles.carInfoCard}>
                    <MaterialIcons name="directions-car" size={24} color="#667eea" />
                    <View style={styles.carInfoText}>
                        <FarsiText style={styles.carModel}>{car?.model || t('messages.yourCar')}</FarsiText>
                        <Text style={styles.carDetails}>
                            {car?.license_plate} • {car?.year} • {car?.color}
                        </Text>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <FarsiText style={styles.sectionTitle}>{t('messages.searchLocation')}</FarsiText>

                    <View style={styles.inputRow}>
                        <View style={[styles.inputContainer, styles.halfInput]}>
                            <MaterialIcons name="location-on" size={20} color="#667eea" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('messages.postCode')}
                                value={postCode}
                                onChangeText={setPostCode}
                                placeholderTextColor="#999"
                            />
                        </View>
                        <View style={[styles.inputContainer, styles.halfInput]}>
                            <MaterialIcons name="location-city" size={20} color="#667eea" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder={t('messages.city')}
                                value={city}
                                onChangeText={setCity}
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="place" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('messages.street')}
                            value={street}
                            onChangeText={setStreet}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="streetview" size={20} color="#667eea" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder={t('messages.alleyOptional')}
                            value={alley}
                            onChangeText={setAlley}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialIcons name="phone" size={20} color="#667eea" style={styles.inputIcon} />
                        <FarsiTextInput
                            style={styles.input}
                            placeholder={t('messages.phoneOptional')}
                            value={homePhone}
                            onChangeText={setHomePhone}
                            keyboardType="phone-pad"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.switchCard}>
                        <View style={styles.switchContent}>
                            <MaterialIcons name="flash-on" size={24} color="#667eea" />
                            <View style={styles.switchTextContainer}>
                                <FarsiText style={styles.switchLabel}>{t('messages.fastCharging')}</FarsiText>
                                <Text style={styles.switchDescription}>
                                    {t('messages.showFastCharge')}
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={fastCharging}
                            onValueChange={setFastCharging}
                            trackColor={{ false: '#ddd', true: '#667eea' }}
                            thumbColor={fastCharging ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.searchButton, loading && styles.searchButtonDisabled]}
                        onPress={handleSearch}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={loading ? ['#ccc', '#999'] : ['#43e97b', '#38f9d7']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <MaterialIcons
                                name={loading ? "hourglass-empty" : "search"}
                                size={24}
                                color="#fff"
                            />
                            <Text style={styles.buttonText}>
                                {loading ? t('messages.searching') : t('messages.findChargingLoc')}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.tipsCard}>
                    <View style={styles.tipsHeader}>
                        <MaterialIcons name="lightbulb" size={24} color="#ff9800" />
                        <FarsiText style={styles.tipsTitle}>{t('messages.searchTip')}</FarsiText>
                    </View>
                    <View style={styles.tipsList}>
                        <View style={styles.tipItem}>
                            <MaterialIcons name="check" size={16} color="#4CAF50" />
                            <Text style={styles.tipText}>{t('messages.specificPostCode')}</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <MaterialIcons name="check" size={16} color="#4CAF50" />
                            <Text style={styles.tipText}>{t('messages.enableFastCharge')}</Text>
                        </View>
                        <View style={styles.tipItem}>
                            <MaterialIcons name="check" size={16} color="#4CAF50" />
                            <Text style={styles.tipText}>{t('messages.requiredFields')}</Text>
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
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
        textAlign: 'center',
    },
    carInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    carInfoText: {
        marginLeft: 12,
        flex: 1,
    },
    carModel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    carDetails: {
        fontSize: 12,
        color: '#666',
    },
    formContainer: {
        padding: 20,
        paddingTop: 0,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    inputRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#333',
    },
    switchCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    switchContent: {
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
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    switchDescription: {
        fontSize: 12,
        color: '#666',
    },
    searchButton: {
        borderRadius: 12,
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        marginBottom: 24,
    },
    searchButtonDisabled: {
        elevation: 2,
        shadowOpacity: 0.1,
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
        marginLeft: 12,
    },
    tipsCard: {
        backgroundColor: '#fff',
        margin: 20,
        marginTop: 0,
        padding: 20,
        borderRadius: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tipsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    tipsList: {
        gap: 12,
    },
    tipItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tipText: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
});
