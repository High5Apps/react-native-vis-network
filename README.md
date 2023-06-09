# react-native-vis-network

[react-native-vis-network](https://github.com/High5Apps/react-native-vis-network#readme) lets you use [vis-network](https://github.com/visjs/vis-network#readme) in your [React Native](https://reactnative.dev/) projects.

![example chart](docs/images/example-network-on-ios.png)

## Installation

```sh
# react-native-vis-network needs to use react-native-webview to work correctly,
# so install it if you haven't previously installed it in your project
npm install react-native-webview

npm install react-native-vis-network
```

## Usage

```js
import React from 'react';
import VisNetwork from 'react-native-vis-network';

export default function MyComponent() {
  
  // Create an array with nodes
  const nodes = [
    { id: 1, label: 'Node 1' },
    { id: 2, label: 'Node 2' },
    { id: 3, label: 'Node 3' },
    { id: 4, label: 'Node 4' },
    { id: 5, label: 'Node 5' },
  ];

  // Create an array with edges
  const edges = [
    { from: 1, to: 3 },
    { from: 1, to: 2 },
    { from: 2, to: 4 },
    { from: 2, to: 5 },
    { from: 3, to: 3 },
  ];

  // Create a VisNetwork
  const data = { edges, nodes };
  return <VisNetwork data={data} />;
}
```

### Event Listeners
You can add event listeners for any [vis-network Event](https://visjs.github.io/vis-network/docs/network/#Events).

Note that the earliest time you can successfully add an event listener is during the `onLoad` callback. If you try to add an event listener before then your callback won't be called.

```js
  const [loading, setLoading] = useState<boolean>(false);
  const visNetworkRef = useRef<VisNetworkRef>(null);

  useEffect(() => {
    if (!loading || !visNetworkRef.current) {
      return;
    }

    const subscription = visNetworkRef.current.addEventListener(
      'click',
      (event: any) => console.log(JSON.stringify(event, null, 2))
    );

    return subscription.remove;
  }, [loading]);

  // ...

  return (
    <VisNetwork
      data={data}
      onLoad={() => setLoading(true)}
      ref={visNetworkRef}
    />
  );
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
