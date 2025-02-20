import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../utils/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getContracts } from '../utils/contract';
import Session from '../components/Session';
import { useMeditationValidation } from '../components/MeditationTracker';
import { ethers } from 'ethers';
import { CHAIN_CONFIG } from '../utils/config';

export default function Dashboard({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [balance, setBalance] = useState('0.00');
  const [staked, setStaked] = useState('0.00');
  const [burned, setBurned] = useState('0.00');
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const { isValid } = useMeditationValidation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          throw new Error('User document not found');
        }

        const provider = new ethers.providers.JsonRpcProvider(CHAIN_CONFIG.rpcUrl);
        const { x1Contract, stakingContract } = getContracts(provider);
        const userAddress = docSnap.data().walletAddress;

        const [bal, stk, brn] = await Promise.all([
          x1Contract.balanceOf(userAddress),
          stakingContract.stakes(userAddress),
          x1Contract.totalBurned()
        ]);

        setBalance(formatUnits(bal));
        setStaked(formatUnits(stk.amount));
        setBurned(formatUnits(brn));
      } catch (error) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatUnits = (value, decimals = 18) => {
    return parseFloat(ethers.utils.formatUnits(value, decimals)).toFixed(2);
  };

  const handleSessionComplete = async () => {
    if (!isValid) return;

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      const { x1Contract } = getContracts(signer);
      const tx = await x1Contract.mint(userAddress, ethers.utils.parseUnits("10", 18));
      await tx.wait();

      await addDoc(collection(db, 'sessions'), {
        userId: auth.currentUser.uid,
        date: new Date().toISOString(),
        duration: 5,
        reward: 10,
      });

      const newBal = await x1Contract.balanceOf(userAddress);
      setBalance(formatUnits(newBal));
    } catch (err) {
      Alert.alert('Transaction Error', err.message);
    } finally {
      setSessionActive(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Meditation Rewards</Text>
      
      <View style={styles.stats}>
        <Text style={styles.statText}>Balance: {balance} X1T</Text>
        <Text style={styles.statText}>Staked: {staked} X1T</Text>
        <Text style={styles.statText}>Total Burned: {burned} X1T</Text>
      </View>

      {sessionActive ? (
        <Session onComplete={handleSessionComplete} />
      ) : (
        <Button
          title={loading ? 'Processing...' : 'Start 5-Minute Session'}
          onPress={() => setSessionActive(true)}
          disabled={loading}
        />
      )}

      <Button
        title="Session History"
        onPress={() => navigation.navigate('History')}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  stats: {
    marginBottom: 30,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statText: {
    fontSize: 16,
    marginVertical: 5,
  },
});
