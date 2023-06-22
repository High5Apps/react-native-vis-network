import type { WebViewMessageEvent } from 'react-native-webview';
import { CallbackCache, isNetworkEventListenerMessage } from './types';

export default function MessageHandler(callbackCache: CallbackCache) {
  return {
    handleMessage(event: WebViewMessageEvent) {
      const { data: messageData } = event.nativeEvent;

      let json: any;
      try {
        json = JSON.parse(messageData);
      } catch {
        console.warn(`Unable to parse message from webview: ${messageData}`);
        return;
      }

      if (!isNetworkEventListenerMessage(json)) {
        console.warn(`Unable to parse networkEventListener: ${messageData}`);
        return;
      }

      const { visNetworkCallbackId, ...visNetworkEvent } = json;
      const callback = callbackCache[visNetworkCallbackId];
      if (!callback) {
        console.warn(`No callback found with id: ${visNetworkCallbackId}`);
        return;
      }

      callback(visNetworkEvent);
    },
  };
}
