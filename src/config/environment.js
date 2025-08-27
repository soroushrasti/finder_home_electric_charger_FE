// src/config/environment.js
import tokens from './env';

const ENV = {
    dev: {
        apiUrl: 'https://finderhomeelectriccharger-production.up.railway.app',
        apiToken: tokens.dev.apiToken,
        googleMapsApiKey: 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk'
    },
    prod: {
        apiUrl: 'https://finderhomeelectriccharger-production.up.railway.app',
        apiToken: tokens.prod.apiToken,
        googleMapsApiKey: 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk'
    }
};

const getEnvVars = () => {
    const isProduction = false;
    return isProduction ? ENV.prod : ENV.dev;
};

export default getEnvVars();
