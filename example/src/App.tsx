import React, { useEffect, useRef, useState } from 'react';

import { Button, StyleSheet, View } from 'react-native';
import VisNetwork, { Data, VisNetworkRef } from 'react-native-vis-network';

export default function App() {
  const [edges, setEdges] = useState<Data['edges']>([
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 3 },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const visNetworkRef = useRef<VisNetworkRef>(null);

  useEffect(() => {
    if (!loading || !visNetworkRef.current) {
      return;
    }

    const subscription = visNetworkRef.current.addEventListener(
      'click',
      (event: any) => console.log(JSON.stringify(event, null, 2))
    );

    return subscription.remove;

    // Note the dependency on loading below. If you try to add an event listener
    // on mount (i.e. dependency of []), the listener won't be registered
    // correctly. That's because at mount time the webview's network hasn't been
    // instantiated yet. onLoad is the earliest time at which listeners can be
    // added successfully.
  }, [loading]);

  // Create an array with nodes
  const nodes = [
    { id: 1, label: 'Node 1' },
    { id: 2, label: 'Node 2' },
    { id: 3, label: 'Node 3' },
    { id: 4, label: 'Node 4' },
    { id: 5, label: 'Node 5' },
  ];

  // Create a network
  const data = { edges, nodes };
  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <VisNetwork
          containerStyle={styles.networkContainer}
          data={data}
          onLoad={() => setLoading(true)}
          ref={visNetworkRef}
        />
      </View>
      <Button
        title="Remove edge"
        onPress={() => setEdges(edges?.slice(0, -1))}
      />
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
