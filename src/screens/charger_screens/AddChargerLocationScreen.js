import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import env from "../../config/environment";

export default function AddChargerLocationScreen({ navigation, route }) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [powerOutput, setPowerOutput] = useState('');
    const [pricePerHour, setPricePerHour] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const user = route.params?.user;
    const onLocationAdded = route.params?.onLocationAdded;

    const handleAddLocation = async () => {
        if (!name || !address || !powerOutput || !pricePerHour) {
            Alert.alert('Missing Information', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/add-charger-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user?.user_id,
                    name,
                    address,
                    power_output: parseFloat(powerOutput),
                    price_per_hour: parseFloat(pricePerHour),
                    description,
                    is_available: true,
                }),
            });

            if (response.ok) {
                Alert.alert('Success! 🎉', 'Your charging station has been added successfully');
                if (onLocationAdded) {
                    onLocationAdded();
                }
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to add charging location. Please try again.');
            }
        } catch (error) {
            Alert.alert('Network Error', 'Please check your connection and try again');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="ev-station" size={50} color="#4285F4" />
                </View>
                <Text style={styles.title}>Add Charging Station</Text>
                <Text style={styles.subtitle}>Share your charger and start earning</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="location-on" size={20} color="#4285F4" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Station Name (e.g., Home Charger)"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#999"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="home" size={20} color="#4285F4" style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Full Address"
                        value={address}
                        onChangeText={setAddress}
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={2}
                    />
                </View>

                <View style={styles.inputRow}>
                    <View style={[styles.inputContainer, styles.halfInput]}>
                        <MaterialIcons name="electric-bolt" size={20} color="#4285F4" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Power (kW)"
                            value={powerOutput}
                            onChangeText={setPowerOutput}
                            keyboardType="decimal-pad"
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={[styles.inputContainer, styles.halfInput]}>
                        <MaterialIcons name="attach-money" size={20} color="#4285F4" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="€/hour"
                            value={pricePerHour}
                            onChangeText={setPricePerHour}
                            keyboardType="decimal-pad"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <MaterialIcons name="description" size={20} color="#4285F4" style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, styles.multilineInput]}
                        placeholder="Description (optional) - Additional details about your charging station"
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={3}
                    />
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddLocation}
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
                <Text style={styles.benefitsTitle}>💡 Benefits of Sharing Your Charger</Text>
                <View style={styles.benefitsList}>
                    <View style={styles.benefitItem}>
                        <MaterialIcons name="attach-money" size={16} color="#34A853" />
                        <Text style={styles.benefitText}>Earn passive income</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <MaterialIcons name="eco" size={16} color="#34A853" />
                        <Text style={styles.benefitText}>Support sustainable transport</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <MaterialIcons name="people" size={16} color="#34A853" />
                        <Text style={styles.benefitText}>Help your community</Text>
                    </View>
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
});
