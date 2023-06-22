import React, { ForwardedRef, forwardRef, useRef } from 'react';
import type { GestureResponderHandlers, ViewStyle } from 'react-native';
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

type Props = GestureResponderHandlers & {
  containerStyle?: ViewStyle;
  data: Data;
  onLoad?: () => void;
  options?: Options;
  style?: ViewStyle;
};

function VisNetwork(
  {
    containerStyle,
    data,
    onLoad,
    options: maybeOptions,
    style,
    ...gestureResponderHandlers
  }: Props,
  ref: ForwardedRef<VisNetworkRef>
) {
  const { edges, nodes } = data;
  const options = maybeOptions ?? {};

  const webviewRef = useRef<WebView>(null);
  const callbackCacheRef = useRef<CallbackCache>({});

  useVisNetworkRef(ref, webviewRef.current, callbackCacheRef.current);

  const initializeNetworkJs = `
    const nodes = new vis.DataSet(${JSON.stringify(nodes)});
    const edges = new vis.DataSet(${JSON.stringify(edges)});
    const container = document.getElementById('container');
    const data = { edges, nodes };
    const options = ${JSON.stringify(options)};
    this.network = new vis.Network(container, data, options);

    this.callbackCache = {}

    this.network.once('stabilized', () => {
      this.network.fit({ maxZoomLevel: 100 });
    });
    true;
  `;

  const { handleMessage } = MessageHandler(callbackCacheRef.current);

  return (
    <WebView
      containerStyle={containerStyle}
      injectedJavaScript={VisNetworkJS + initializeNetworkJs}
      onLoad={onLoad}
      originWhitelist={['*']}
      onMessage={handleMessage}
      ref={webviewRef}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      source={{ html }}
      style={style}
      {...gestureResponderHandlers}
    />
  );
}

export default forwardRef(VisNetwork);
