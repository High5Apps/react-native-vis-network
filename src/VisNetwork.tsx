import React, {
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import type { ViewStyle } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import {
  Data,
  EventCallback,
  NetworkEvents,
  Options,
  VisNetworkRef,
  VisNetworkMessage,
  isVisNetworkMessage,
  isNetworkEventListenerMessage,
} from './types';
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

const getRandomCallbackId = () => Math.random().toString().slice(2);

type CallbackCache = { [key: string]: EventCallback };

type Props = {
  containerStyle?: ViewStyle;
  data: Data;
  onLoad?: () => void;
  options?: Options;
  style?: ViewStyle;
};

function VisNetwork(
  { containerStyle, data, onLoad, options: maybeOptions, style }: Props,
  ref: ForwardedRef<VisNetworkRef>
) {
  const { edges, nodes } = data;
  const options = maybeOptions ?? {};

  const webviewRef = useRef<WebView>(null);
  const callbackCacheRef = useRef<CallbackCache>({});

  useImperativeHandle(
    ref,
    () => {
      if (!webviewRef.current) {
        console.warn('Attempted to use webview before the ref was set');
      }

      const cacheCallback = (callback: EventCallback) => {
        const id = getRandomCallbackId();
        callbackCacheRef.current[id] = callback;
        return id;
      };

      function removeEventListener(
        eventName: NetworkEvents,
        callbackId: string
      ) {
        webviewRef.current?.injectJavaScript(`
          const callback = this.callbackCache['${callbackId}'];
          this.network.off('${eventName}', callback);
          delete this.callbackCache['${callbackId}']
          true;
        `);

        delete callbackCacheRef.current[callbackId];
      }

      return {
        addEventListener(eventName: NetworkEvents, callback: EventCallback) {
          const id = cacheCallback(callback);

          webviewRef.current?.injectJavaScript(`
            // Need to add id suffix to handler variable name to prevent
            // "Can't create duplicate variable: 'handler'" error when adding
            // multiple listeners
            const handler${id} = (event) => {
              const message = {
                eventName: '${eventName}',
                type: 'networkEventListener',
                visNetworkCallbackId: '${id}',
                ...event,
              };
              const stringifiedMessage = JSON.stringify(message);
              window.ReactNativeWebView.postMessage(stringifiedMessage);
            };

            this.callbackCache['${id}'] = handler${id}

            this.network.on('${eventName}', handler${id});
            true;
        `);

          return { remove: () => removeEventListener(eventName, id) };
        },
      };
    },
    [webviewRef]
  );

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
          this.network = new vis.Network(container, data, options);

          this.callbackCache = {}

          const onLoad = { type: 'onLoad' };
          const onLoadMessage = JSON.stringify(onLoad);
          window.ReactNativeWebView.postMessage(onLoadMessage);

          this.network.once('stabilized', () => {
            this.network.fit({ maxZoomLevel: 100 });
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
            console.warn(`Unknown message from webview: ${messageData}`);
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
        } else if (type === 'networkEventListener') {
          if (!isNetworkEventListenerMessage(visNetworkMessage)) {
            console.warn(
              `Unable to parse networkEventListener: ${messageData}`
            );
            return;
          }

          const { visNetworkCallbackId, ...visNetworkEvent } =
            visNetworkMessage;

          const callback = callbackCacheRef.current[visNetworkCallbackId];
          if (!callback) {
            console.warn(`No callback found with id: ${visNetworkCallbackId}`);
            return;
          }

          callback(visNetworkEvent);
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

export default forwardRef(VisNetwork);
