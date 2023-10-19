import { useEffect, type RefObject } from 'react';
import type WebView from 'react-native-webview';
import type { Options } from './types';

export default function useOptionsReloader(
  webviewRef: RefObject<WebView>,
  webviewLoaded: boolean,
  maybeOptions?: Options
) {
  useEffect(() => {
    if (!webviewLoaded || !webviewRef.current) {
      return;
    }

    const webview = webviewRef.current;
    const options = maybeOptions ?? {};
    webview.injectJavaScript(`
      this.network.setOptions(${JSON.stringify(options)});
      true;
    `);
  }, [maybeOptions, webviewLoaded, webviewRef]);
}
