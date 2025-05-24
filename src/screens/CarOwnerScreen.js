// src/screens/CarOwnerScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import env from '../config/environment';

export default function CarOwnerScreen({ user }) {
    const [cars, setCars] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCar, setNewCar] = useState({
        model_car: '',
        year_of_construction: '',
        color: ''
    });

    const fetchCars = async () => {
        try {
            const response = await fetch(`${env.apiUrl}/find-car`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${env.apiToken}`
                },
                body: JSON.stringify({ user_id: user.id })
            });

            const data = await response.json();
            if (response.ok) {
                setCars(data);
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch cars');
            }
        } catch (error) {
            console.error('Fetch cars error:', error);
            Alert.alert('Error', 'Network error');
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleAddCar = async () => {
        try {
            const payload = {
                user_id: user.id,
                model_car: newCar.model_car,
                year_of_construction: newCar.year_of_construction,
                color: newCar.color
            };

            const response = await fetch(`${env.apiUrl}/add-car`, {
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
                fetchCars(); // Refresh car list
                Alert.alert('Success', 'Car added successfully!');
            } else {
                Alert.alert('Error', data.message || 'Failed to add car');
            }
        } catch (error) {
            console.error('Add car error:', error);
            Alert.alert('Error', 'Network error');
        }
    };

    const renderCarItem = ({ item }) => (
        <View style={styles.carItem}>
            <Text style={styles.carModel}>{item.model_car}</Text>
            <Text>Year: {item.year_of_construction}</Text>
            <Text>Color: {item.color}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Cars</Text>

            <FlatList
                data={cars}
                renderItem={renderCarItem}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.empty}>No cars found</Text>}
            />

            <Button title="Add New Car" onPress={() => setModalVisible(true)} />

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Add New Car</Text>
                    <TextInput
                        placeholder="Car Model"
                        value={newCar.model_car}
                        onChangeText={(text) => setNewCar({...newCar, model_car: text})}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Year of Construction"
                        value={newCar.year_of_construction}
                        onChangeText={(text) => setNewCar({...newCar, year_of_construction: text})}
                        keyboardType="number-pad"
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Color"
                        value={newCar.color}
                        onChangeText={(text) => setNewCar({...newCar, color: text})}
                        style={styles.input}
                    />
                    <View style={styles.buttonRow}>
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                        <Button title="Save" onPress={handleAddCar} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    carItem: { padding: 16, marginBottom: 8, backgroundColor: '#f0f0f0', borderRadius: 8 },
    carModel: { fontSize: 18, fontWeight: 'bold' },
    empty: { textAlign: 'center', marginVertical: 20 },
    modalContainer: { flex: 1, padding: 24, justifyContent: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    input: { borderWidth: 1, marginBottom: 12, padding: 8, borderRadius: 4 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 }
});
