import { ForwardedRef, useImperativeHandle } from 'react';
import type {
  CallbackCache,
  EventCallback,
  FitOptions,
  FocusOptions,
  IdType,
  NetworkEvents,
  Position,
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

      function send(methodName: string, ...params: any[]) {
        webview?.injectJavaScript(`
          this.network.${methodName}(...${JSON.stringify(params)});
          true;
        `);
      }

      function sendWithResult(
        callback: EventCallback,
        methodName: string,
        params: any[]
      ) {
        const id = cacheCallback((result: any) => {
          callback(result);
          delete callbackCache[id];
        });
        const filteredParams = params.filter((p) => !!p);
        const stringifiedParams = filteredParams.length
          ? `...${JSON.stringify(params)}`
          : '';
        webview?.injectJavaScript(`
          window.ReactNativeWebView.postMessage(JSON.stringify({
            result: this.network.${methodName}(${stringifiedParams}),
            visNetworkCallbackId: '${id}',
          }));
          true;
        `);
      }

      async function sendWithResultAsync(
        methodName: string,
        ...params: any[]
      ): Promise<any> {
        const result = await new Promise((resolve) => {
          sendWithResult(resolve, methodName, params);
        });
        return result;
      }

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
            this.callbackCache['${id}'] = (event) => {
              const message = {
                  eventName: '${eventName}',
                  visNetworkCallbackId: '${id}',
                  ...event,
              };
              const stringifiedMessage = JSON.stringify(message);
              window.ReactNativeWebView.postMessage(stringifiedMessage);
            };

            this.network.on('${eventName}', this.callbackCache['${id}']);

            true;
          `);

          return { remove: () => removeEventListener(eventName, id) };
        },
        async getPositions(
          nodeIds?: IdType[] | IdType
        ): Promise<{ [nodeId: string]: Position }> {
          return sendWithResultAsync('getPositions', nodeIds);
        },
        fit(options?: FitOptions): void {
          send('fit', options);
        },
        focus(nodeId: IdType, options?: FocusOptions): void {
          send('focus', nodeId, options);
        },
      };
    },
    [callbackCache, webview]
  );
}
