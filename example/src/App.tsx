import React from 'react';

import { StyleSheet, View } from 'react-native';
import VisNetwork from 'react-native-vis-network';

export default function App() {
  // Create an array with nodes
  const nodes = [
    { id: 1, label: 'Node 1' },
    { id: 2, label: 'Node 2' },
    { id: 3, label: 'Node 3' },
    { id: 4, label: 'Node 4' },
    { id: 5, label: 'Node 5' },
  ];

  // Create an array with edges
  const edges = [
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 3 },
  ];

  // Create a network
  const data = { edges, nodes };
  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <VisNetwork containerStyle={styles.networkContainer} data={data} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#ccc',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    aspectRatio: 1,
  },
  networkContainer: {
    borderColor: 'blue',
    borderWidth: 1,
  },
});
