// src/config/environment.js
import tokens from './env';

const ENV = {
    dev: {
        apiUrl: 'http://10.0.2.2:8080',
        apiToken: tokens.dev.apiToken
    },
    prod: {
        apiUrl: 'http://123.345:8080',
        apiToken: tokens.prod.apiToken
    }
};

const getEnvVars = () => {
    const isProduction = false;
    return isProduction ? ENV.prod : ENV.dev;
};

export default getEnvVars();
