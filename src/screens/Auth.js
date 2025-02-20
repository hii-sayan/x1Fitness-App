import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [walletAddress, setWalletAddress] = useState(''); // New field
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEthAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const testDB = async () => {
    try {
      const docRef = doc(db, "test", "test");
      await setDoc(docRef, { message: "Database working!" });
      const docSnap = await getDoc(docRef);
      console.log("Database test:", docSnap.data());
    } catch (e) {
      console.error("Database error:", e);
    }
  };

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        // Login logic remains unchanged
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Validate wallet address format
        if (!validateEthAddress(walletAddress)) {
          throw new Error('Invalid Ethereum wallet address');
        }
        
        // Create user account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          walletAddress: walletAddress,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Ethereum Wallet Address (0x...)"
          value={walletAddress}
          onChangeText={setWalletAddress}
          autoCapitalize="none"
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
        onPress={handleAuth}
        disabled={loading || (!isLogin && !validateEthAddress(walletAddress))}
      />

      <Button
        title={`Switch to ${isLogin ? 'Sign Up' : 'Login'}`}
        onPress={() => {
          setIsLogin(!isLogin);
          setError(''); // Clear error on switch
        }}
        color="#666"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
});