import { useEffect, type RefObject } from 'react';
import type WebView from 'react-native-webview';
import type { ChosenLabelValues, ChosenNodeValues, Options } from './types';

type ChosenStringProps =
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

export function getOptionsString(options?: Options) {
  const { nodes, ...staticOptions } = options ?? {};
  const { chosen: nodesChosen, ...staticNodeChosen } = nodes ?? {};
  return `{
    ${!staticOptions ? '' : '...' + JSON.stringify(staticOptions) + ','}
    ${
      !nodes
        ? ''
        : `nodes: {
          ...${JSON.stringify(staticNodeChosen)},
          ${
            typeof nodesChosen === 'undefined'
              ? ''
              : `chosen: ${
                  typeof nodesChosen === 'boolean'
                    ? nodesChosen
                    : `{
                      ...${JSON.stringify(nodesChosen)},
                      ${getChosenString({
                        chosenValues: nodesChosen.node,
                        key: 'node',
                      })}
                      ${getChosenString({
                        chosenValues: nodesChosen.label,
                        key: 'label',
                      })}
                    },`
                }`
          }
        },`
    }
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
