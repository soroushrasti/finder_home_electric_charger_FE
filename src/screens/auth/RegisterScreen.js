import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Title, HelperText, RadioButton } from 'react-native-paper';
import env from '../../config/environment';

export default function RegisterScreen() {
    const [form, setForm] = useState({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        postCode: '',
        userType: 'ELECTRIC_CAR_OWNER',
        mobile: '',
    });

    const handleChange = (name, value) => {
        setForm({ ...form, [name]: value });
    };

    const handleRegister = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`,
                },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Registration successful!');
            } else {
                Alert.alert('Error', data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', 'Network error');
        }
    };

    return (
        <View style={styles.container}>
            <Title style={styles.title}>Register</Title>
            <TextInput
                label="Username"
                value={form.username}
                onChangeText={(v) => handleChange('username', v)}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="First Name"
                value={form.firstName}
                onChangeText={(v) => handleChange('firstName', v)}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Last Name"
                value={form.lastName}
                onChangeText={(v) => handleChange('lastName', v)}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Email"
                value={form.email}
                onChangeText={(v) => handleChange('email', v)}
                mode="outlined"
                keyboardType="email-address"
                style={styles.input}
            />
            <TextInput
                label="Address"
                value={form.address}
                onChangeText={(v) => handleChange('address', v)}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="City"
                value={form.city}
                onChangeText={(v) => handleChange('city', v)}
                mode="outlined"
                style={styles.input}
            />
            <TextInput
                label="Post Code"
                value={form.postCode}
                onChangeText={(v) => handleChange('postCode', v)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
            />
            <TextInput
                label="Mobile"
                value={form.mobile}
                onChangeText={(v) => handleChange('mobile', v)}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
            />
            <Text style={styles.radioLabel}>User Type</Text>
            <RadioButton.Group
                onValueChange={(v) => handleChange('userType', v)}
                value={form.userType}
            >
                <View style={styles.radioContainer}>
                    <RadioButton value="ELECTRIC_CAR_OWNER" />
                    <Text>Electric Car Owner</Text>
                </View>
                <View style={styles.radioContainer}>
                    <RadioButton value="HOMEOWNER" />
                    <Text>Homeowner</Text>
                </View>
            </RadioButton.Group>
            <Button mode="contained" onPress={handleRegister} style={styles.button}>
                Register
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f9f9f9' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { marginBottom: 10 },
    radioLabel: { marginTop: 10, fontSize: 16, fontWeight: 'bold' },
    radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    button: { marginTop: 20, padding: 10 },
});
