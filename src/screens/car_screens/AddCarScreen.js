import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";
import FarsiText from  "../../components/FarsiText";
import parseFarsiInt from  "../../components/parseFarsiInt";
import FarsiTextInput from  "../../components/FarsiTextInput";
import {useTranslation} from "react-i18next";


export default function AddCarScreen({ navigation, route }) {
    const { t } = useTranslation();
    const [model, setModel] = useState('');
    const [color, setColor] = useState('');
    const [year, setYear] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [loading, setLoading] = useState(false);

    const user = route.params?.user;
    const onCarAdded = route.params?.onCarAdded;

    const handleAddCar = async () => {
        if (!model || !color || !year || !licensePlate) {
            Alert.alert(t('messages.infoMissing'), t('messages.fillToContinue'));
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/add-car`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Token': `${env.apiToken} `,
                },
                body: JSON.stringify({
                    user_id: user?.user_id,
                    model,
                    color,
                    year: parseFarsiInt(year),
                    license_plate: licensePlate
                })
            });

            if (response.ok) {
                if (onCarAdded) {
                    onCarAdded();
                }
                navigation.goBack();
            } else {
                Alert.alert(t('messages.error'), t('messages.addCarFail'));
            }
        } catch (error) {
            console.error(t('messages.errorAddCar'), error);
            Alert.alert(t('messages.Network Error'), t('messages.checkConnection'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView
            style={[styles.container, Platform.OS === 'web' ? { height: '100vh', overflow: 'auto' } : {}]}
            contentContainerStyle={Platform.OS === 'web' ? { flexGrow: 1 } : {}}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="directions-car" size={50} color="#4285F4" />
                </View>
                <FarsiText style={styles.title}>{t('messages.addElCar')}</FarsiText>
                <FarsiText style={styles.subtitle}>{t('messages.getVehicle')}</FarsiText>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="directions-car" size={20} color="#4285F4" style={styles.inputIcon} />
                    <FarsiTextInput
                        style={styles.input}
                        placeholder= {t('messages.carModel')}
                        value={model}
                        onChangeText={setModel}
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="palette" size={20} color="#4285F4" style={styles.inputIcon} />
                    <FarsiTextInput
                        style={styles.input}
                        placeholder= {t('messages.color')}
                        value={color}
                        onChangeText={setColor}
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="calendar-today" size={20} color="#4285F4" style={styles.inputIcon} />
                    <FarsiTextInput
                        style={styles.input}
                        placeholder= {t('messages.year')}
                        value={year}
                        onChangeText={setYear}
                        keyboardType="numeric"
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="confirmation-number" size={20} color="#4285F4" style={styles.inputIcon} />
                    <FarsiTextInput
                        style={styles.input}
                        placeholder= {t('messages.license')}
                        value={licensePlate}
                        onChangeText={setLicensePlate}
                        autoCapitalize="characters"
                        placeholderTextColor="#999"
                    />
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddCar}
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
                            <MaterialIcons name="add" size={24} color="#fff" />
                        )}
                        <FarsiText style={styles.buttonText}>
                            {loading ? t('messages.addingCar') : t('messages.addedCar')}
                        </FarsiText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
                <MaterialIcons name="info" size={24} color="#4285F4" />
                <View style={styles.infoText}>
                    <FarsiText style={styles.infoTitle}>{t('messages.whyInfo')}</FarsiText>
                    <FarsiText style={styles.infoDescription}>
                        {t('messages.matchCarWithStation')}
                    </FarsiText>
                </View>
            </View>
        </ScrollView>
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
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#e3f2fd',
        margin: 20,
        padding: 16,
        borderRadius: 12,
        alignItems: 'flex-start',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1976d2',
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
});
