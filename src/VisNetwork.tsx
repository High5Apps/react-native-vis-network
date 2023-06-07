import React, { useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import VisNetworkJS from './vis-network@9.1.6.min.js';
import type { Data, Options } from './types';

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
  options?: Options;
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

  const webviewRef = useRef<WebView>(null);

  // Must set an onMessage handler, even if it's a no-op, or else the
  // injectedJavaScript won't be run on iOS. For more info, see:
  // https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#injectedjavascript
  const onMessage = () => {};

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
      onMessage={onMessage}
      ref={webviewRef}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      source={{ html }}
      style={style}
    />
  );
}
