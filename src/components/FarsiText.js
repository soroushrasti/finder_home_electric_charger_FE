import React from 'react';
import { Text, Platform } from 'react-native';

const containsFarsi = (text) => {
    if (!text || typeof text !== 'string') return false;
    const farsiRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return farsiRegex.test(text);
};

const FarsiText = ({ children, style, ...props }) => {
    const isFarsi = containsFarsi(children);
    return (
        <Text
            style={[
                style,
                isFarsi && {
                    textAlign: 'right',
                    writingDirection: 'rtl',
                },
                { fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }
            ]}
            {...props}
        >
            {children}
        </Text>
    );
};

export default FarsiText;
