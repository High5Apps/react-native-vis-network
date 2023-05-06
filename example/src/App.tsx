import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import VisNetwork from 'react-native-vis-network';

export default function App() {
  return (
    <View style={styles.container}>
      <VisNetwork />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
