import React, { useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import VisNetworkJS from './vis-network@9.1.6.min.js';

type NodeId = number | string;

type Props = {
  containerStyle?: ViewStyle;
  data: {
    edges: { from: NodeId; to: NodeId }[];
    nodes: { id: NodeId; label?: string }[];
  };
  options?: any;
  style?: ViewStyle;
};

export default function VisNetwork({
  containerStyle,
  data,
  options: maybeOptions,
  style,
}: Props) {
  const { edges, nodes } = data;
  const options = maybeOptions ?? {};
  const html = `
    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
      <div id="container" style="height: 100vh;"></div>
    </body>
    </html>
  `;

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
          network.once('stabilized', () => {
            network.fit({ maxZoomLevel: 100 });
          });
          true;
        `);
      }}
      originWhitelist={['*']}
      ref={webviewRef}
      source={{ html }}
      style={style}
    />
  );
}
