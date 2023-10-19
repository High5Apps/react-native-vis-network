import { RefObject, useEffect } from 'react';
import type WebView from 'react-native-webview';
import type { Data } from './types';

export default function useDataReloader(
  webviewRef: RefObject<WebView>,
  webviewLoaded: boolean,
  data: Data,
  maybeZoomFitOnStabilized?: boolean
) {
  useEffect(() => {
    if (!webviewLoaded || !webviewRef.current) {
      return;
    }

    const webview = webviewRef.current;
    const { edges, nodes } = data;
    const zoomFitOnStabilized = maybeZoomFitOnStabilized ?? true;
    webview.injectJavaScript(`
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
  }, [data, maybeZoomFitOnStabilized, webviewLoaded, webviewRef]);
}
