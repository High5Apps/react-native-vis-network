import * as React from 'react';
import graph from './graph.json';

import { StyleSheet, View } from 'react-native';
import VisNetwork from 'react-native-vis-network';

const accent = '#8944AB';

export default function App() {
  const { edges, nodes } = graph;
  const options = {
    edges: {
      color: accent,
      width: 2,
    },
    interaction: {
      dragNodes: false,
      dragView: false,
      keyboard: false,
      selectable: false,
      zoomView: false,
    },
    layout: {
      randomSeed: 12345,
    },
    nodes: {
      color: accent,
    },
  };
  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <VisNetwork
          containerStyle={styles.networkContainer}
          edges={edges}
          nodes={nodes}
          options={options}
        />
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
    borderColor: accent,
    borderWidth: 10,
  },
});
