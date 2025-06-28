import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Switch } from 'react-native';

export default function ChargerLocationsScreen({ navigation, route }) {
    const [postCode, setPostCode] = useState('');
    const [alley, setAlley] = useState('');
    const [street, setStreet] = useState('');
    const [homePhone, setHomePhone] = useState('');
    const [city, setCity] = useState('');
    const [fastCharging, setFastCharging] = useState(false);
    const [loading, setLoading] = useState(false);

    const { car, user } = route.params;

    const handleSearch = async () => {
        if (!postCode || !street || !city) {
            Alert.alert('Error', 'Please fill required fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('YOUR_API_URL/find-car-charger-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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

            if (response.ok) {
                const data = await response.json();
                // Navigate to booking confirmation with location data
                navigation.navigate('BookingConfirmation', {
                    car,
                    user,
                    chargingLocation: data.location
                });
            } else {
                Alert.alert('Error', 'No charging locations found');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Find Charger Location</Text>

            <TextInput
                style={styles.input}
                placeholder="Post Code *"
                value={postCode}
                onChangeText={setPostCode}
            />

            <TextInput
                style={styles.input}
                placeholder="Street *"
                value={street}
                onChangeText={setStreet}
            />

            <TextInput
                style={styles.input}
                placeholder="Alley"
                value={alley}
                onChangeText={setAlley}
            />

            <TextInput
                style={styles.input}
                placeholder="City *"
                value={city}
                onChangeText={setCity}
            />

            <TextInput
                style={styles.input}
                placeholder="Home Phone Number"
                value={homePhone}
                onChangeText={setHomePhone}
                keyboardType="phone-pad"
            />

            <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Fast Charging</Text>
                <Switch
                    value={fastCharging}
                    onValueChange={setFastCharging}
                />
            </View>

            <Button
                title={loading ? "Searching..." : "Search Locations"}
                onPress={handleSearch}
                disabled={loading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 16,
    },
});
