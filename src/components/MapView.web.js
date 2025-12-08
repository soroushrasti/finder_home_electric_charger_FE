// Mock MapView for web - this file is used as a replacement for react-native-maps on web
import React from 'react';
import { View } from 'react-native';

// Mock MapView component
export const MapView = ({ children, style, ...props }) => {
  return (
    <View style={[style, { backgroundColor: '#e0e0e0' }]}>
      {children}
    </View>
  );
};

// Mock Marker component
export const Marker = ({ children, ...props }) => {
  return children || null;
};

// Mock constants
export const PROVIDER_GOOGLE = 'google';

export default MapView;

