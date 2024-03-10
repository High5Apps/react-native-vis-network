import { useEffect, type RefObject } from 'react';
import type WebView from 'react-native-webview';
import type {
  ChosenEdgeValues,
  ChosenLabelValues,
  ChosenNodeValues,
  EdgeChosen,
  EdgeOptions,
  NodeChosen,
  NodeOptions,
  Options,
} from './types';

type ChosenStringProps =
  | {
      chosenValues: Partial<ChosenEdgeValues> | boolean;
      key: 'edge';
    }
  | {
      chosenValues: Partial<ChosenNodeValues> | boolean;
      key: 'node';
    }
  | {
      chosenValues: Partial<ChosenLabelValues> | boolean;
      key: 'label';
    };
function getChosenString({ chosenValues, key }: ChosenStringProps) {
  return typeof chosenValues === 'boolean'
    ? ''
    : `${key}: (values) => {
    ${Object.entries(chosenValues)
      .map(([k, v]) => `values.${k} = ${JSON.stringify(v)};`)
      .join(' ')}
    },`;
}

type EdgesOrNodesStringProps =
  | {
      key: 'edges';
      keyOptions: EdgeOptions;
    }
  | {
      key: 'nodes';
      keyOptions: NodeOptions;
    };
function getEdgesOrNodesString({ key, keyOptions }: EdgesOrNodesStringProps) {
  const { chosen, ...staticKeyChosen } = keyOptions;
  return `${key}: {
    ...${JSON.stringify(staticKeyChosen)},
    ${
      typeof chosen === 'undefined'
        ? ''
        : `chosen: ${
            typeof chosen === 'boolean'
              ? chosen
              : `{
                ...${JSON.stringify(chosen)},
                ${
                  key === 'edges'
                    ? getChosenString({
                        chosenValues: (chosen as EdgeChosen).edge,
                        key: 'edge',
                      })
                    : getChosenString({
                        chosenValues: (chosen as NodeChosen).node,
                        key: 'node',
                      })
                }
                ${getChosenString({
                  chosenValues: chosen.label,
                  key: 'label',
                })}
              },`
          }`
    }
  },`;
}

export function getOptionsString(options?: Options) {
  const { edges, nodes, ...staticOptions } = options ?? {};
  return `{
    ${!staticOptions ? '' : '...' + JSON.stringify(staticOptions) + ','}
    ${!edges ? '' : getEdgesOrNodesString({ key: 'edges', keyOptions: edges })}
    ${!nodes ? '' : getEdgesOrNodesString({ key: 'nodes', keyOptions: nodes })}
  }`.replace(/\s+/g, ' ');
}

export default function useOptionsReloader(
  webviewRef: RefObject<WebView>,
  webviewLoaded: boolean,
  options?: Options
) {
  useEffect(() => {
    if (!webviewLoaded || !webviewRef.current) {
      return;
    }

    const webview = webviewRef.current;
    const optionsString = getOptionsString(options);
    webview.injectJavaScript(`
      this.network.setOptions(${optionsString});
      true;
    `);
  }, [options, webviewLoaded, webviewRef]);
}
