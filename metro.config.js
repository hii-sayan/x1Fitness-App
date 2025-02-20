const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  resolver: {
    ...config.resolver,
    extraNodeModules: {
      ...require('node-libs-react-native'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      'stream-browserify': require.resolve('stream-browserify'),
      Buffer: require.resolve('buffer'),
      url: require.resolve('url'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify'),
      path: require.resolve('path-browserify'),
    },
  },
}; 