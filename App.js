import './polyfills';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import SignClient from '@walletconnect/sign-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from './src/screens/Dashboard'; // Ensure the path matches your Dashboard file
import * as Google from 'expo-auth-session/providers/google';

const PROJECT_ID = '74a3a8ab42f6d962b1be0ccefd5c2bd4';
const RELAY_URL = 'wss://relay.walletconnect.com';
const metadata = {
  name: 'My React Native App',
  description: 'My React Native app using WalletConnect v2',
  url: 'https://myapp.com',
  icons: ['https://myapp.com/icon.png'],
};

// Custom button component with rounded styling
const CustomButton = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.button, disabled && styles.buttonDisabled, style]}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

function WalletConnectScreen({ navigation }) {
  // WalletConnect states
  const [signClient, setSignClient] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  // Google login state
  const [googleUser, setGoogleUser] = useState(null);

  // Configure Google authentication request.
  // Replace the client IDs below with your own.
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_EXPO_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    webClientId: 'YOUR_WEB_CLIENT_ID',
  });

  // Listen for the Google authentication response.
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setGoogleUser(data);
        })
        .catch((error) =>
          console.error('Google login error:', error)
        );
    }
  }, [response]);

  // Initialize WalletConnect SignClient
  useEffect(() => {
    const initSignClient = async () => {
      try {
        const client = await SignClient.init({
          projectId: PROJECT_ID,
          relayUrl: RELAY_URL,
          metadata,
          // storage: AsyncStorage, // Uncomment if you want to persist sessions
        });
        setSignClient(client);
      } catch (error) {
        console.error('Failed to initialize WalletConnect SignClient:', error);
      }
    };

    initSignClient();
  }, []);

  // Function to connect a wallet using WalletConnect
  const connectWallet = async () => {
    if (!signClient) return;
    setLoading(true);
    try {
      const { uri, approval } = await signClient.connect({
        requiredNamespaces: {
          eip155: {
            methods: [
              'eth_sendTransaction',
              'eth_signTransaction',
              'eth_sign',
              'personal_sign',
              'eth_signTypedData',
            ],
            chains: ['eip155:1'],
            events: ['chainChanged', 'accountsChanged'],
          },
        },
      });

      if (uri) {
        const deepLink = `metamask://wc?uri=${encodeURIComponent(uri)}`;
        Linking.openURL(deepLink);
      }

      const session = await approval();
      setSession(session);
    } catch (error) {
      console.error('Error during wallet connection:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to disconnect the current wallet session.
  const disconnectWallet = async () => {
    if (signClient && session) {
      try {
        await signClient.disconnect({
          topic: session.topic,
          reason: {
            code: 6000,
            message: 'User disconnected',
          },
        });
        setSession(null);
      } catch (error) {
        console.error('Error during disconnection:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to X1Fitness App</Text>
      {!session ? (
        <CustomButton
          title={loading ? 'Connecting...' : 'Connect Wallet'}
          onPress={connectWallet}
          disabled={loading}
        />
      ) : (
        <View style={styles.sessionContainer}>
          <Text style={styles.sessionText}>
            Connected Account: {session.namespaces.eip155.accounts[0]}
          </Text>
          <CustomButton title="Disconnect" onPress={disconnectWallet} />
        </View>
      )}

      {/* Google Login Section */}
      {googleUser ? (
        <View style={styles.googleInfo}>
          <Text>Welcome, {googleUser.name}</Text>
        </View>
      ) : (
        <CustomButton title="Sign in with Google" onPress={() => promptAsync()} />
      )}

      {/* Button to navigate to Meditation Tracker */}
      <CustomButton
        title="Go to Meditation Tracker"
        onPress={() => navigation.navigate('MeditationTracker')}
      />
    </View>
  );
}

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={WalletConnectScreen} />
        <Stack.Screen
          name="MeditationTracker"
          component={Dashboard}
          options={{ title: 'Meditation Tracker' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20 
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20 
  },
  sessionContainer: { 
    alignItems: 'center', 
    marginVertical: 10 
  },
  sessionText: { 
    fontSize: 16, 
    marginBottom: 20, 
    color: 'gray' 
  },
  googleInfo: { 
    marginVertical: 10 
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginVertical: 8,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
});
