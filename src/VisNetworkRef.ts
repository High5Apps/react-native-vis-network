import { ForwardedRef, RefObject, useImperativeHandle } from 'react';
import type {
  BoundingBox,
  CallbackCache,
  Data,
  DirectionType,
  EventCallback,
  FitOptions,
  FocusOptions,
  IdType,
  MoveToOptions,
  NetworkEvents,
  Options,
  Position,
  VisNetworkRef,
} from './types';
import type WebView from 'react-native-webview';

const getRandomCallbackId = () => Math.random().toString().slice(2);

export default function useVisNetworkRef(
  ref: ForwardedRef<VisNetworkRef | null>,
  webviewRef: RefObject<WebView | null>,
  callbackCacheRef: RefObject<CallbackCache>
) {
  useImperativeHandle<VisNetworkRef | null, VisNetworkRef | null>(
    ref,
    () => {
      if (!webviewRef.current || !callbackCacheRef.current) {
        return null;
      }

      const webview = webviewRef.current;
      const callbackCache = callbackCacheRef.current;

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
        addEdgeMode(): void {
          send('addEdgeMode');
        },
        addNodeMode(): void {
          send('addNodeMode');
        },
        async canvasToDOM(position: Position): Promise<Position> {
          return sendWithResultAsync('canvasToDOM', position);
        },
        deleteSelected(): void {
          send('deleteSelected');
        },
        destroy(): void {
          send('destroy');
        },
        async DOMtoCanvas(position: Position): Promise<Position> {
          return sendWithResultAsync('DOMtoCanvas', position);
        },
        editEdgeMode(): void {
          send('editEdgeMode');
        },
        async findNode(nodeId: IdType): Promise<IdType[]> {
          return sendWithResultAsync('findNode', nodeId);
        },
        async getBaseEdge(clusteredEdgeId: IdType): Promise<IdType> {
          return sendWithResultAsync('getBaseEdge', clusteredEdgeId);
        },
        async getBaseEdges(clusteredEdgeId: IdType): Promise<IdType[]> {
          return sendWithResultAsync('getBaseEdges', clusteredEdgeId);
        },
        async getBoundingBox(nodeId: IdType): Promise<BoundingBox> {
          return sendWithResultAsync('getBoundingBox', nodeId);
        },
        async getClusteredEdges(baseEdgeId: IdType): Promise<IdType[]> {
          return sendWithResultAsync('getClusteredEdges', baseEdgeId);
        },
        async getConnectedEdges(nodeId: IdType): Promise<IdType[]> {
          return sendWithResultAsync('getConnectedEdges', nodeId);
        },
        async getConnectedNodes(
          nodeOrEdgeId: IdType,
          direction?: DirectionType
        ): Promise<IdType[] | Array<{ fromId: IdType; toId: IdType }>> {
          return sendWithResultAsync(
            'getConnectedNodes',
            nodeOrEdgeId,
            direction
          );
        },
        async getEdgeAt(position: Position): Promise<IdType> {
          return sendWithResultAsync('getEdgeAt', position);
        },
        async getNodeAt(position: Position): Promise<IdType> {
          return sendWithResultAsync('getNodeAt', position);
        },
        async getNodesInCluster(clusterNodeId: IdType): Promise<IdType[]> {
          return sendWithResultAsync('getNodesInCluster', clusterNodeId);
        },
        async getOptionsFromConfigurator(): Promise<any> {
          return sendWithResultAsync('getOptionsFromConfigurator');
        },
        async getPosition(nodeId: IdType): Promise<Position> {
          return sendWithResultAsync('getPosition', nodeId);
        },
        async getPositions(
          nodeIds?: IdType[] | IdType
        ): Promise<{ [nodeId: string]: Position }> {
          return sendWithResultAsync('getPositions', nodeIds);
        },
        async getScale(): Promise<number> {
          return sendWithResultAsync('getScale');
        },
        async getSeed(): Promise<number | string> {
          return sendWithResultAsync('getSeed');
        },
        async getSelectedEdges(): Promise<IdType[]> {
          return sendWithResultAsync('getSelectedEdges');
        },
        async getSelectedNodes(): Promise<IdType[]> {
          return sendWithResultAsync('getSelectedNodes');
        },
        async getSelection(): Promise<{ nodes: IdType[]; edges: IdType[] }> {
          return sendWithResultAsync('getSelection');
        },
        async getViewPosition(): Promise<Position> {
          return sendWithResultAsync('getViewPosition');
        },
        fit(options?: FitOptions): void {
          send('fit', options);
        },
        focus(nodeId: IdType, options?: FocusOptions): void {
          send('focus', nodeId, options);
        },
        async isCluster(nodeId: IdType): Promise<boolean> {
          return sendWithResultAsync('isCluster', nodeId);
        },
        moveNode(nodeId: IdType, x: number, y: number): void {
          send('moveNode', nodeId, x, y);
        },
        moveTo(options: MoveToOptions): void {
          send('moveTo', options);
        },
        redraw(): void {
          send('redraw');
        },
        releaseNode(): void {
          send('releaseNode');
        },
        selectEdges(edgeIds: IdType[]): void {
          send('selectEdges', edgeIds);
        },
        selectNodes(nodeIds: IdType[], highlightEdges?: boolean): void {
          send('selectNodes', nodeIds, highlightEdges);
        },
        setData(data: Data): void {
          send('setData', data);
        },
        setOptions(options: Options): void {
          send('setOptions', options);
        },
        setSize(width: string, height: string): void {
          send('setSize', width, height);
        },
        stabilize(iterations?: number): void {
          send('stabilize', iterations);
        },
        startSimulation(): void {
          send('startSimulation');
        },
        stopSimulation(): void {
          send('stopSimulation');
        },
        unselectAll(): void {
          send('unselectAll');
        },
      };
    },
    [callbackCacheRef, webviewRef]
  );
}
