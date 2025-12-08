// src/config/environment.js
import tokens from './env';

const ENV = {
    dev: {
        apiUrl: 'http://185.213.165.46:8000',
        apiToken: tokens.dev.apiToken,
        googleMapsApiKey: 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk'
    },
    prod: {
        apiUrl: 'http://185.213.165.46:8000',
        apiToken: tokens.prod.apiToken,
        googleMapsApiKey: 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk'
    }
};

const getEnvVars = () => {
    const isProduction = true;
    return isProduction ? ENV.prod : ENV.dev;
};

export default getEnvVars();
