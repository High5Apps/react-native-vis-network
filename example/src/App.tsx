import React, { useEffect, useRef, useState } from 'react';

import { Button, StyleSheet, Text, View } from 'react-native';
import VisNetwork, { Data, VisNetworkRef } from 'react-native-vis-network';

export default function App() {
  const [data, setData] = useState<Data>({
    edges: [
      { from: 1, to: 3 },
      { from: 1, to: 2 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 3 },
    ],
    nodes: [
      { id: 1, label: 'Node 1' },
      { id: 2, label: 'Node 2' },
      { id: 3, label: 'Node 3' },
      { id: 4, label: 'Node 4' },
      { id: 5, label: 'Node 5' },
    ],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [zoomView, setZoomView] = useState<boolean>(true);

  const visNetworkRef = useRef<VisNetworkRef>(null);

  useEffect(() => {
    if (!loading || !visNetworkRef.current) {
      return;
    }

    const clickSubscription = visNetworkRef.current.addEventListener(
      'click',
      ({ nodes }: any) => setSelectedNodeId(nodes[0])
    );

    const progressSubscription = visNetworkRef.current.addEventListener(
      'stabilizationProgress',
      ({ iterations, total }: any) => setProgress(iterations / total)
    );

    const doneSubscription = visNetworkRef.current.addEventListener(
      'stabilizationIterationsDone',
      () => setProgress(1)
    );

    return () => {
      clickSubscription.remove();
      progressSubscription.remove();
      doneSubscription.remove();
    };

    // Note the dependency on loading below. If you try to add an event listener
    // on mount (i.e. dependency of []), the listener won't be registered
    // correctly. That's because at mount time the webview's network hasn't been
    // instantiated yet. onLoad is the earliest time at which listeners can be
    // added successfully.
  }, [loading]);

  return (
    <View style={styles.background}>
      <Text style={styles.text}>
        {`Loading progress: ${Math.round(100 * progress)}%`}
      </Text>
      <Text style={styles.text}>
        {selectedNodeId ? `Node ${selectedNodeId} clicked` : 'No node clicked'}
      </Text>
      <View style={styles.container}>
        <VisNetwork
          containerStyle={styles.networkContainer}
          data={data}
          onLoad={() => setLoading(true)}
          options={{ interaction: { zoomView } }}
          ref={visNetworkRef}
        />
      </View>
      <Button
        title="Remove edge"
        onPress={() => {
          const updatedData = { ...data };
          updatedData.edges = updatedData.edges?.slice(1);
          setData(updatedData);
        }}
      />
      <Button
        title={zoomView ? 'Disable zoom' : 'Enable zoom'}
        onPress={() => setZoomView(!zoomView)}
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
    rowGap: 5,
  },
  container: {
    aspectRatio: 1,
  },
  networkContainer: {
    borderColor: 'blue',
    borderWidth: 1,
  },
  text: {
    fontSize: 17,
    textAlign: 'center',
  },
});
