import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSwitcher() {
    const { language, changeLanguage } = useLanguage();

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.button, language === 'en' && styles.activeButton]}
                onPress={() => changeLanguage('en')}
            >
                <Text style={[styles.text, language === 'en' && styles.activeText]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.button, language === 'fa' && styles.activeButton]}
                onPress={() => changeLanguage('fa')}
            >
                <Text style={[styles.text, language === 'fa' && styles.activeText]}>فا</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',  // Add this to put buttons in same row
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 2,
        minWidth: 80,
        maxWidth: 100,
    },
    button: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        flex: 1,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    text: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    activeText: {
        color: '#667eea',
        fontWeight: 'bold',
    },
});
