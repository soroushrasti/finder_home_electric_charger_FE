import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";
import FarsiText from  "../../components/FarsiText";
import parseFarsiInt from  "../../components/parseFarsiInt";
import FarsiTextInput from  "../../components/FarsiTextInput";
import {useTranslation} from "react-i18next";


export default function EditCarScreen({ navigation, route }) {
    const { t } = useTranslation();
    const car = route.params;

    const [model, setModel] = useState('car.model');
    const [color, setColor] = useState('car.color');
    const [year, setYear] = useState('car.year');
    const [licensePlate, setLicensePlate] = useState('car.licensePlate');
    const [loading, setLoading] = useState(false);

    const user = route.params?.user;
    const onCarUpdated = route.params?.onCarUpdated;

    const handleUpdateCar = async () => {

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/update-car`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Token': `${env.apiToken} `,
                },
                body: JSON.stringify({
                    car_id: car?.car_id,
                    model,
                    color,
                    year,
                    licensePlate
                })
            });

            if (response.ok) {
                Alert.alert(t('messages.success') ,  t('messages.updateCar'));
                if (onCarUpdated) {
                    onCarUpdated();
                }
                navigation.goBack();
            } else {
                Alert.alert(t('messages.error'), t('messages.updateCarFail'));
            }
        } catch (error) {
            console.error(t('messages.errorEditCar'), error);
            Alert.alert(t('messages.Network Error'), t('messages.checkConnection'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="directions-car" size={50} color="#4285F4" />
                </View>
                <FarsiText style={styles.title}>{t('messages.editElCar')}</FarsiText>
                <FarsiText style={styles.subtitle}>{t('messages.getEditVehicle')}</FarsiText>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="directions-car" size={20} color="#4285F4" style={styles.inputIcon} />
                    <FarsiTextInput
                        style={styles.input}
                        placeholder={car.model}
                        value={model}
                        onChangeText={setModel}
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="palette" size={20} color="#4285F4" style={styles.inputIcon} />
                    <FarsiTextInput
                        style={styles.input}
                        placeholder= {car.color}
                        value={color}
                        onChangeText={setColor}
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="calendar-today" size={20} color="#4285F4" style={styles.inputIcon} />
                    <FarsiTextInput
                        style={styles.input}
                        placeholder= {car.year}
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
                        placeholder= {car.licensePlate}
                        value={licensePlate}
                        onChangeText={setLicensePlate}
                        autoCapitalize="characters"
                        placeholderTextColor="#999"
                    />
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleUpdateCar}
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
