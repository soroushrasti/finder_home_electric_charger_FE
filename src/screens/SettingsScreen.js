import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';

const SettingsScreen = () => {
    const openPrivacyPolicy = () => {
        Linking.openURL('https://soroushrasti.github.io/finder_home_electric_charger/docs/privacy-policy.html');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.item} onPress={openPrivacyPolicy}>
                <Text style={styles.itemText}>Privacy Policy</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    item: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    itemText: {
        fontSize: 16,
        color: '#007AFF',
    },
});

export default SettingsScreen;
