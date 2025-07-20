import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [isRTL, setIsRTL] = useState(false);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('language');
            if (savedLanguage) {
                changeLanguage(savedLanguage);
            }
        } catch (error) {
            console.error('Error loading language:', error);
        }
    };

    const changeLanguage = async (lang) => {
        try {
            setLanguage(lang);
            i18n.changeLanguage(lang);
            const rtl = lang === 'fa';
            setIsRTL(rtl);
            I18nManager.forceRTL(rtl);
            await AsyncStorage.setItem('language', lang);
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    return (
        <LanguageContext.Provider value={{
            language,
            isRTL,
            changeLanguage
        }}>
            {children}
        </LanguageContext.Provider>
    );
};
