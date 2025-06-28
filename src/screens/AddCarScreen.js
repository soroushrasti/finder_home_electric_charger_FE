import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import env from "../config/environment";

export default function AddCarScreen({ navigation, route }) {
    const [model, setModel] = useState('');
    const [color, setColor] = useState('');
    const [year, setYear] = useState('');
    const [licensePlate, setLicensePlate] = useState('');
    const [loading, setLoading] = useState(false);

    const user = route.params?.user;

    const handleAddCar = async () => {
        if (!model || !color || !year || !licensePlate) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${env.apiUrl}/add-car`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user?.user_id,
                    model,
                    color,
                    year: parseInt(year),
                    license_plate: licensePlate,
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Car added successfully');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to add car');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add New Car</Text>

            <TextInput
                style={styles.input}
                placeholder="Model (e.g., Tesla)"
                value={model}
                onChangeText={setModel}
            />

            <TextInput
                style={styles.input}
                placeholder="Color"
                value={color}
                onChangeText={setColor}
            />

            <TextInput
                style={styles.input}
                placeholder="Year"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
            />

            <TextInput
                style={styles.input}
                placeholder="License Plate"
                value={licensePlate}
                onChangeText={setLicensePlate}
            />

            <Button
                title={loading ? "Adding..." : "Add Car"}
                onPress={handleAddCar}
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
});
