import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// Polyfill for crypto and Buffer
global.Buffer = Buffer;
global.process = require('process');
global.process.env.NODE_ENV = __DEV__ ? 'development' : 'production'; 