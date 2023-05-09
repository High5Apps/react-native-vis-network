import React from 'react';
import type { ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

const VIS_NETWORK_VERSION = '9.1.6';

type Props = {
  containerStyle?: ViewStyle;
  data: {
    edges: { from: string; to: string }[];
    nodes: { id: string }[];
  };
  options: any;
  style?: ViewStyle;
};

export default function VisNetwork({
  containerStyle,
  data,
  options,
  style,
}: Props) {
  const { edges, nodes } = data;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <script
    type="text/javascript"
    src="https://unpkg.com/vis-network@${VIS_NETWORK_VERSION}/standalone/umd/vis-network.min.js">
  </script>
</head>
<body>
<div id="container" style="height: 100vh;"></div>
<script type="text/javascript">
    const nodes = new vis.DataSet(${JSON.stringify(nodes)});
    const edges = new vis.DataSet(${JSON.stringify(edges)});
    const container = document.getElementById('container');
    const data = { edges, nodes };
    const options = ${JSON.stringify(options)};
    const network = new vis.Network(container, data, options);
    network.fit();
</script>
</body>
</html>
`;

  return (
    <WebView
      containerStyle={containerStyle}
      originWhitelist={['*']}
      source={{ html }}
      style={style}
    />
  );
}
