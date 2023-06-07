import React, { useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Data, Options, VisNetworkMessage, isVisNetworkMessage } from './types';
import VisNetworkJS from './vis-network@9.1.6.min.js';

const html = `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <div id="container" style="height: 100vh;"></div>
</body>
</html>
`;

type Props = {
  containerStyle?: ViewStyle;
  data: Data;
  onLoad?: () => void;
  options?: Options;
  style?: ViewStyle;
};

export default function VisNetwork({
  containerStyle,
  data,
  onLoad,
  options: maybeOptions,
  style,
}: Props) {
  const { edges, nodes } = data;
  const options = maybeOptions ?? {};

  const webviewRef = useRef<WebView>(null);

  return (
    <WebView
      containerStyle={containerStyle}
      injectedJavaScript={VisNetworkJS}
      onLoad={() => {
        webviewRef.current?.injectJavaScript(`
          const nodes = new vis.DataSet(${JSON.stringify(nodes)});
          const edges = new vis.DataSet(${JSON.stringify(edges)});
          const container = document.getElementById('container');
          const data = { edges, nodes };
          const options = ${JSON.stringify(options)};
          const network = new vis.Network(container, data, options);

          const onLoad = { type: 'onLoad' };
          const onLoadMessage = JSON.stringify(onLoad);
          window.ReactNativeWebView.postMessage(onLoadMessage);

          network.once('stabilized', () => {
            network.fit({ maxZoomLevel: 100 });
          });
          true;
        `);
      }}
      originWhitelist={['*']}
      onMessage={(event: WebViewMessageEvent) => {
        const { data: messageData } = event.nativeEvent;

        let visNetworkMessage: VisNetworkMessage;
        try {
          const maybeVisNetworkMessage = JSON.parse(messageData);
          if (!isVisNetworkMessage(maybeVisNetworkMessage)) {
            console.warn(
              `Unknown message from webview: ${maybeVisNetworkMessage}`
            );
            return;
          }
          visNetworkMessage = maybeVisNetworkMessage;
        } catch {
          console.warn(`Unable to parse message from webview: ${messageData}`);
          return;
        }

        const { type } = visNetworkMessage;
        if (type === 'onLoad') {
          onLoad?.();
        }
      }}
      ref={webviewRef}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      source={{ html }}
      style={style}
    />
  );
}
