import React from 'react';
import { TextInput, Platform } from 'react-native';

const containsFarsi = (text) => {
    if (!text || typeof text !== 'string') return false;
    const farsiRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return farsiRegex.test(text);
};

const FarsiTextInput = ({ style, value, onChangeText, ...props }) => {
    const getTextInputStyle = (text) => {
        return containsFarsi(text) ? {
            textAlign: 'right',
            writingDirection: 'rtl',
        } : {
            textAlign: 'left',
            writingDirection: 'ltr',
        };
    };

    return (
        <TextInput
            style={[
                style,
                getTextInputStyle(value),
                { fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }
            ]}
            value={value}
            onChangeText={onChangeText}
            {...props}
        />
    );
};

export default FarsiTextInput;
