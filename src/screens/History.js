import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { db, auth } from '../utils/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function SessionHistory() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: new Date(doc.data().date).toLocaleDateString()
      }));
      setSessions(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Session History</Text>
      
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.session}>
            <Text>Date: {item.date}</Text>
            <Text>Duration: {item.duration} mins</Text>
            <Text>Reward: {item.reward} X1T</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    marginBottom: 15,
  },
  session: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});