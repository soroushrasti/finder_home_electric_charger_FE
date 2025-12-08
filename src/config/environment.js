// src/config/environment.js
import tokens from './env';
import Constants from 'expo-constants';

// Get environment variables
const getEnvVar = (key, fallback = '') => {
    // For Expo, use Constants.expoConfig.extra or process.env
    if (Constants.expoConfig?.extra?.[key]) {
        return Constants.expoConfig.extra[key];
    }
    // For web, use process.env with EXPO_PUBLIC_ prefix
    if (typeof process !== 'undefined' && process.env) {
        return process.env[`EXPO_PUBLIC_${key}`] || process.env[key] || fallback;
    }
    return fallback;
};

const ENV = {
    dev: {
        apiUrl: getEnvVar('API_URL', 'http://185.213.165.46:8000'),
        apiToken: tokens.dev.apiToken,
        googleMapsApiKey: getEnvVar('GOOGLE_MAPS_API_KEY', '')
    },
    prod: {
        apiUrl: getEnvVar('API_URL', 'http://185.213.165.46:8000'),
        apiToken: tokens.prod.apiToken,
        googleMapsApiKey: getEnvVar('GOOGLE_MAPS_API_KEY', '')
    }
};

const getEnvVars = () => {
    const isProduction = true;
    return isProduction ? ENV.prod : ENV.dev;
};

export default getEnvVars();
