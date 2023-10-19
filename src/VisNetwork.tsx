import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  type GestureResponderHandlers,
  type ViewStyle,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { CallbackCache, Data, Options, VisNetworkRef } from './types';
import VisNetworkJS from './vis-network@9.1.6.min.js';
import MessageHandler from './MessageHandler';
import useVisNetworkRef from './VisNetworkRef';

const html = `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <div id="container" style="height: 100vh;"></div>
</body>
</html>
`;

const initializeNetworkJs = `
  const nodes = new vis.DataSet([]);
  const edges = new vis.DataSet([]);
  const container = document.getElementById('container');
  const data = { edges, nodes };
  const options = {};
  this.network = new vis.Network(container, data, options);

  this.callbackCache = {}

  true;
`;

type Props = GestureResponderHandlers & {
  containerStyle?: ViewStyle;
  data: Data;
  onLoad?: () => void;
  options?: Options;
  style?: ViewStyle;
  zoomFitOnStabilized?: boolean;
};

function VisNetwork(
  {
    containerStyle,
    data,
    onLoad,
    options: maybeOptions,
    style,
    zoomFitOnStabilized: maybeZoomFitOnStabilized,
    ...gestureResponderHandlers
  }: Props,
  ref: ForwardedRef<VisNetworkRef>
) {
  const webviewRef = useRef<WebView>(null);
  const callbackCacheRef = useRef<CallbackCache>({});
  const [loaded, setLoaded] = useState(false);

  useVisNetworkRef(ref, webviewRef, callbackCacheRef);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const { edges, nodes } = data;
    const zoomFitOnStabilized = maybeZoomFitOnStabilized ?? true;
    webviewRef.current?.injectJavaScript(`
      this.network.setData({
        edges: new vis.DataSet(${JSON.stringify(edges)}),
        nodes: new vis.DataSet(${JSON.stringify(nodes)}),
      });

      if (${zoomFitOnStabilized}) {
        this.network.once('stabilized', () => {
          this.network.fit({ maxZoomLevel: 100 });
        });
      }

      true;
    `);
  }, [data, loaded, maybeZoomFitOnStabilized]);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    const options = maybeOptions ?? {};
    webviewRef.current?.injectJavaScript(`
      this.network.setOptions(${JSON.stringify(options)});
      true;
    `);
  }, [maybeOptions, loaded]);

  const { handleMessage } = MessageHandler(callbackCacheRef.current);

  return (
    <View renderToHardwareTextureAndroid style={styles.container}>
      <WebView
        containerStyle={containerStyle}
        injectedJavaScript={VisNetworkJS + initializeNetworkJs}
        nestedScrollEnabled
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        originWhitelist={['*']}
        onMessage={handleMessage}
        ref={webviewRef}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        source={{ html }}
        style={style}
        {...gestureResponderHandlers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default forwardRef(VisNetwork);
