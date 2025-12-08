// Universal scroll wrapper for consistent scrolling across all platforms
import React from 'react';
import { ScrollView, Platform, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Inject web-specific styles for proper scrolling
if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        * {
            -webkit-overflow-scrolling: touch;
        }
        html, body, #root {
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            overflow: auto;
        }
        [data-focusable="true"] {
            outline: none;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Universal scroll wrapper that handles scrolling consistently across web, iOS, and Android
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.contentContainerStyle - Style for content container
 * @param {Object} props.style - Style for scroll view
 * @param {boolean} props.keyboardAware - Whether to use keyboard aware scrolling (default: true)
 * @param {boolean} props.showsVerticalScrollIndicator - Show scroll indicator (default: true)
 */
export default function ScrollWrapper({
    children,
    contentContainerStyle,
    style,
    keyboardAware = true,
    showsVerticalScrollIndicator = true,
    ...otherProps
}) {
    // Use KeyboardAwareScrollView for native, ScrollView for web
    const Container = Platform.OS === 'web' || !keyboardAware
        ? ScrollView
        : KeyboardAwareScrollView;

    const defaultProps = {
        showsVerticalScrollIndicator,
        bounces: true,
        scrollEnabled: true,
        nestedScrollEnabled: true,
        keyboardShouldPersistTaps: 'handled',
    };

    // Add platform-specific props
    const nativeProps = Platform.OS !== 'web' && keyboardAware ? {
        enableOnAndroid: true,
        extraScrollHeight: 40,
        enableAutomaticScroll: true,
    } : {};

    // Add web-specific styles
    const webStyle = Platform.OS === 'web' ? {
        height: '100vh',
        overflow: 'auto',
    } : {};

    const webContentStyle = Platform.OS === 'web' ? {
        minHeight: '100%',
        flexGrow: 1,
    } : {
        flexGrow: 1,
    };

    return (
        <Container
            style={[styles.container, webStyle, style]}
            contentContainerStyle={[webContentStyle, contentContainerStyle]}
            {...defaultProps}
            {...nativeProps}
            {...otherProps}
        >
            {children}
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});

