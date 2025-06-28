// src/screens/HomeOwnerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, Modal, Switch, Alert } from 'react-native';
import env from '../config/environment';

export default function HomeOwnerScreen({ user }) {
    const [chargers, setChargers] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const [newLocation, setNewLocation] = useState({
        "postCode":"",
        "alley":"",
        "street":"",
        "homePhoneNumber":"",
        "city":"",
        "fastCharging":true
    });

    useEffect(() => {
        fetchChargerLocations();
    }, []);

    const fetchChargerLocations = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/charging_locations/users/${user.user_id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${env.apiToken}`
                },
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


    const handleAddLocation = async () => {
        try {
            if (!newLocation.city) {
                Alert.alert('Error', 'City is required');
                return;
            }

            const payload = {
                userId: user.user_id,
                ...newLocation
            };

            const response = await fetch(`${env.apiUrl}/charging_location`, {
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
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.street}, {item.city}</Text>
            <Text style={styles.cardSubtitle}>Postcode: {item.postcode}</Text>
            <Text style={styles.cardSubtitle}>Alley: {item.alley}</Text>
            <Text style={styles.cardSubtitle}>Phone: {item.home_phone_number}</Text>
            <Text style={styles.cardSubtitle}>Fast Charger: {item.fast_charger ? 'Yes' : 'No'}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Charger Locations</Text>


            <FlatList
                data={chargers}
                renderItem={renderChargerItem}
                keyExtractor={(item) => item.userId.toString()}
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
                        value={newLocation.postCode}
                        onChangeText={(text) => setNewLocation({...newLocation, postCode: text})}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Home Phone Number"
                        value={newLocation.homePhoneNumber}
                        onChangeText={(text) => setNewLocation({...newLocation, homePhoneNumber: text})}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />

                    <View style={styles.switchContainer}>
                        <Text>Fast Charger</Text>
                        <Switch
                            value={newLocation.fastCharging}
                            onValueChange={(value) => setNewLocation({...newLocation, fastCharging: value})}
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
    card: {
        padding: 16,
        marginVertical: 8,
        backgroundColor: '# ',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 2,
    },
});
