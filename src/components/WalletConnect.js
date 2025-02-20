import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import WalletConnect from "@walletconnect/client";
import { ethers } from 'ethers';
import { INFURA_PROJECT_ID } from '@env';

const WalletConnectComponent = ({ onConnect }) => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connector, setConnector] = useState(null);
  const [connectionMessage, setConnectionMessage] = useState('');

  const connectWallet = async () => {
    try {
      setLoading(true);

      // Create a WalletConnect connector instance.
      // (No check is made here for MetaMask installation.)
      const walletConnector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org",
        // If you have a custom redirect URL, you could add:
        // redirectUrl: 'yourappscheme://'
      });

      // If there's no active session, create one.
      if (!walletConnector.connected) {
        await walletConnector.createSession();
        // Instead of opening MetaMask automatically, we simply log the URI
        // and inform the user that they need to approve the session manually.
        console.log("WalletConnect URI:", walletConnector.uri);
        setConnectionMessage(
          "Please open MetaMask, go to its WalletConnect screen, and select this session to connect."
        );
      } else {
        setConnectionMessage("Connecting to your wallet...");
      }

      setConnector(walletConnector);

      // Listen for the connection event
      walletConnector.on("connect", (error, payload) => {
        if (error) {
          throw error;
        }

        const { accounts, chainId } = payload.params[0];
        const userAddress = accounts[0];
        setAddress(userAddress);
        setConnectionMessage('');

        // Create an ethers provider using Infura
        const provider = new ethers.JsonRpcProvider(
          `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`
        );

        onConnect({ 
          provider,
          address: userAddress,
          chainId
        });
      });

      // Listen for disconnect events
      walletConnector.on("disconnect", (error) => {
        if (error) {
          console.error(error);
        }
        setAddress(null);
        setConnector(null);
        setConnectionMessage('');
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      Alert.alert(
        'Connection Error',
        'Failed to connect to MetaMask. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (connector) {
        await connector.killSession();
        setAddress(null);
        setConnector(null);
        setConnectionMessage('');
        Alert.alert('Success', 'Wallet disconnected successfully');
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      Alert.alert('Error', 'Failed to disconnect wallet');
    }
  };

  // (No deep link event listeners are needed since we aren’t opening MetaMask automatically.)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect Your Wallet</Text>
      {!address ? (
        <TouchableOpacity 
          style={styles.button}
          onPress={connectWallet}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View>
          <Text style={styles.addressText}>
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </Text>
          <TouchableOpacity 
            style={[styles.button, styles.disconnectButton]}
            onPress={disconnectWallet}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
      {connectionMessage ? (
        <Text style={styles.connectionMessage}>{connectionMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 12,
    width: 250,
    alignItems: 'center',
    marginBottom: 10,
  },
  disconnectButton: {
    backgroundColor: '#DC3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressText: {
    marginVertical: 20,
    fontSize: 16,
    color: '#666',
  },
  connectionMessage: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
    textAlign: 'center'
  }
});

export default WalletConnectComponent;
