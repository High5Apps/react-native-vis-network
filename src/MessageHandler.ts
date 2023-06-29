import type { WebViewMessageEvent } from 'react-native-webview';
import {
  CallbackCache,
  isNetworkEventListenerMessage,
  isNetworkMethodListenerMessage,
} from './types';

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

      const { visNetworkCallbackId, ...rest } = json;
      let payload: any;
      if (isNetworkEventListenerMessage(json)) {
        payload = rest;
      } else if (isNetworkMethodListenerMessage(json)) {
        const { result } = rest;
        payload = result;
      }

      const callback = callbackCache[visNetworkCallbackId];
      if (!callback) {
        console.warn(`No callback found with id: ${visNetworkCallbackId}`);
        return;
      }

      callback(payload);
    },
  };
}
