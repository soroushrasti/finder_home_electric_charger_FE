// src/screens/HomeOwnerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, Modal, Switch, Alert } from 'react-native';
import env from '../config/environment';

export default function HomeOwnerScreen({ user }) {
    const [chargers, setChargers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchParams, setSearchParams] = useState({
        city: '',
        postcode: '',
        alley: '',
        street: ''
    });

    const [newLocation, setNewLocation] = useState({
        postcode: '',
        alley: '',
        street: '',
        home_phone_number: '',
        city: '',
        fast_charger: false
    });

    const fetchChargerLocations = async () => {
        try {
            // Ensure city is provided as it's mandatory
            if (!searchParams.city) {
                Alert.alert('Error', 'City is required for search');
                return;
            }

            const payload = {
                user_id: user.id,
                ...searchParams
            };

            const response = await fetch(`${env.apiUrl}/find-car-charger-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                setChargers(data);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch charger locations');
            }
        } catch (error) {
            console.error('Fetch chargers error:', error);
            Alert.alert('Error', 'Network error');
        }
    };

    useEffect(() => {
        // Initialize with city from user data if available
        if (user && user.city) {
            setSearchParams(prev => ({ ...prev, city: user.city }));
        }
        fetchChargerLocations();
    }, []);

    const handleAddLocation = async () => {
        try {
            if (!newLocation.city) {
                Alert.alert('Error', 'City is required');
                return;
            }

            const payload = {
                user_id: user.id,
                ...newLocation
            };

            const response = await fetch(`${env.apiUrl}/add-car-charger-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                setModalVisible(false);
                fetchChargerLocations();
                Alert.alert('Success', 'Charger location added successfully!');
            } else {
                Alert.alert('Error', data.message || 'Failed to add charger location');
            }
        } catch (error) {
            console.error('Add location error:', error);
            Alert.alert('Error', 'Network error');
        }
    };

    const renderChargerItem = ({ item }) => (
        <View style={styles.chargerItem}>
            <Text style={styles.chargerTitle}>
                {item.street}, {item.city}
            </Text>
            <Text>{item.postcode} {item.alley}</Text>
            <Text>Phone: {item.home_phone_number}</Text>
            <Text>Fast Charger: {item.fast_charger ? 'Yes' : 'No'}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Charger Locations</Text>

            <View style={styles.searchContainer}>
                <TextInput
                    placeholder="City (required)"
                    value={searchParams.city}
                    onChangeText={(text) => setSearchParams({...searchParams, city: text})}
                    style={styles.searchInput}
                />
                <Button title="Search" onPress={fetchChargerLocations} />
            </View>

            <FlatList
                data={chargers}
                renderItem={renderChargerItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.empty}>No charger locations found</Text>}
            />

            <Button title="Add Charger Location" onPress={() => setModalVisible(true)} />

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Add Charger Location</Text>

                    <TextInput
                        placeholder="City (required)"
                        value={newLocation.city}
                        onChangeText={(text) => setNewLocation({...newLocation, city: text})}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Street"
                        value={newLocation.street}
                        onChangeText={(text) => setNewLocation({...newLocation, street: text})}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Alley"
                        value={newLocation.alley}
                        onChangeText={(text) => setNewLocation({...newLocation, alley: text})}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Postcode"
                        value={newLocation.postcode}
                        onChangeText={(text) => setNewLocation({...newLocation, postcode: text})}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Home Phone Number"
                        value={newLocation.home_phone_number}
                        onChangeText={(text) => setNewLocation({...newLocation, home_phone_number: text})}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />

                    <View style={styles.switchContainer}>
                        <Text>Fast Charger</Text>
                        <Switch
                            value={newLocation.fast_charger}
                            onValueChange={(value) => setNewLocation({...newLocation, fast_charger: value})}
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                        <Button title="Save" onPress={handleAddLocation} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    searchContainer: { marginBottom: 16 },
    searchInput: { borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 4 },
    chargerItem: { padding: 16, marginBottom: 8, backgroundColor: '#f0f0f0', borderRadius: 8 },
    chargerTitle: { fontSize: 18, fontWeight: 'bold' },
    empty: { textAlign: 'center', marginVertical: 20 },
    modalContainer: { flex: 1, padding: 24, justifyContent: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    input: { borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 4 },
    switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }
});
