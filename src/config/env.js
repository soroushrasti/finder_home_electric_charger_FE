// src/config/env.js
import Constants from 'expo-constants';

// Get API token from environment variables
const getApiToken = () => {
    if (Constants.expoConfig?.extra?.API_TOKEN) {
        return Constants.expoConfig.extra.API_TOKEN;
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env.EXPO_PUBLIC_API_TOKEN || process.env.API_TOKEN || '';
    }
    return '';
};

export default {
    dev: {
        apiToken: getApiToken()
    },
    prod: {
        apiToken: getApiToken()
    }
};
