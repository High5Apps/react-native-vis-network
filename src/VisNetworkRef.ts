import { ForwardedRef, useImperativeHandle } from 'react';
import type {
  CallbackCache,
  EventCallback,
  NetworkEvents,
  VisNetworkRef,
} from './types';
import type WebView from 'react-native-webview';

const getRandomCallbackId = () => Math.random().toString().slice(2);

export default function useVisNetworkRef(
  ref: ForwardedRef<VisNetworkRef>,
  webview: WebView | null,
  callbackCache: CallbackCache
) {
  useImperativeHandle(
    ref,
    () => {
      const cacheCallback = (callback: EventCallback) => {
        const id = getRandomCallbackId();
        callbackCache[id] = callback;
        return id;
      };

      function removeEventListener(
        eventName: NetworkEvents,
        callbackId: string
      ) {
        webview?.injectJavaScript(`
          const callback = this.callbackCache['${callbackId}'];
          this.network.off('${eventName}', callback);
          delete this.callbackCache['${callbackId}']
          true;
        `);

        delete callbackCache[callbackId];
      }

      return {
        addEventListener(eventName: NetworkEvents, callback: EventCallback) {
          const id = cacheCallback(callback);

          webview?.injectJavaScript(`
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
    [callbackCache, webview]
  );
}
