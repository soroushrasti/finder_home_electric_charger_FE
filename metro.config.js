// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web platform support
config.resolver.platforms = ['web', 'ios', 'android'];

// Handle platform-specific extensions
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'];
config.resolver.assetExts = ['glb', 'gltf', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ttf', 'otf', 'woff', 'woff2'];

// Add aliases for web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Redirect react-native-maps to a web-friendly implementation when on web
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      filePath: require.resolve('./src/components/MapView.web.js'),
      type: 'sourceFile',
    };
  }

  // Use default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

