// Cross-platform alert for React Native and Web
import { Alert, Platform } from 'react-native';

/**
 * Cross-platform alert that works on native (iOS/Android) and web
 * @param {string} title - Alert title
 * @param {string} message - Alert message
 * @param {Array} buttons - Array of button configs [{text, onPress, style}]
 * @param {Object} options - Additional options
 */
export const showAlert = (title, message, buttons = [], options = {}) => {
    if (Platform.OS === 'web') {
        // Web implementation using custom modal or browser confirm/alert
        const hasCallback = buttons.length > 0 && buttons[0].onPress;

        // For simple alerts
        if (buttons.length <= 1) {
            window.alert(`${title}\n\n${message}`);
            if (hasCallback) {
                buttons[0].onPress();
            }
        } else {
            // For confirm dialogs (2 buttons)
            const confirmed = window.confirm(`${title}\n\n${message}`);
            if (confirmed && buttons[0].onPress) {
                buttons[0].onPress();
            } else if (!confirmed && buttons[1] && buttons[1].onPress) {
                buttons[1].onPress();
            }
        }
    } else {
        // Native implementation
        Alert.alert(title, message, buttons, options);
    }
};

export default showAlert;

