// HistoryScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { db, auth } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const HistoryScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const q = query(
          collection(db, 'sessions'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const sessionData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: new Date(doc.data().date).toLocaleDateString()
        }));

        setSessions(sessionData.sort((a, b) => b.date - a.date));
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Session History</Text>
      
      {sessions.length === 0 ? (
        <Text style={styles.emptyText}>No sessions recorded yet</Text>
      ) : (
        sessions.map(session => (
          <View key={session.id} style={styles.sessionCard}>
            <Text style={styles.dateText}>{session.date}</Text>
            <View style={styles.sessionInfo}>
              <Text>Duration: {session.duration} mins</Text>
              <Text>Reward: +{session.reward} X1T</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
};

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
  sessionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateText: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default HistoryScreen;