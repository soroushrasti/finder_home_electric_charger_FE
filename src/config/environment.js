// src/config/environment.js
import tokens from './env';

const ENV = {
    dev: {
        apiUrl: 'https://finderhomeelectriccharger-production.up.railway.app',
        apiToken: tokens.dev.apiToken
    },
    prod: {
        apiUrl: 'https://finderhomeelectriccharger-production.up.railway.app',
        apiToken: tokens.prod.apiToken
    }
};

const getEnvVars = () => {
    const isProduction = false;
    return isProduction ? ENV.prod : ENV.dev;
};

export default getEnvVars();
