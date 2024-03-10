import { getOptionsString } from '../OptionsReloader';

function parseOptionsString(optionsString: string) {
  // eslint-disable-next-line no-eval
  return eval(`(${optionsString})`);
}

describe('getOptionsString', () => {
  it('handles chosen boolean', () => {
    [false, true].forEach((value) => {
      const options = { nodes: { chosen: value } };
      const optionsString = getOptionsString(options);
      expect(parseOptionsString(optionsString)).toEqual(options);
    });
  });

  it('should handle chosen node and label booleans', () => {
    const cases: [boolean, boolean][] = [
      [false, false],
      [false, true],
      [true, false],
      [true, true],
    ];
    cases.forEach(([label, node]) => {
      const options = { nodes: { chosen: { label, node } } };
      const optionsString = getOptionsString(options);
      expect(parseOptionsString(optionsString)).toEqual(options);
    });
  });

  it('should handle chosen label ChosenLabelValues object', () => {
    const options = {
      nodes: {
        chosen: {
          label: {
            color: 'green',
            size: 36,
          },
          node: false,
        },
      },
    };
    const optionsString = getOptionsString(options);
    const parsedOptions = parseOptionsString(optionsString);

    const values = {};
    parsedOptions.nodes.chosen.label(values);

    expect(values).toEqual(options.nodes.chosen.label);
    expect(parsedOptions.nodes.chosen.node).toEqual(options.nodes.chosen.node);
  });

  it('should handle chosen node ChosenNodeValues object', () => {
    const options = {
      nodes: {
        chosen: {
          label: false,
          node: {
            color: 'red',
            shadow: true,
          },
        },
      },
    };
    const optionsString = getOptionsString(options);
    const parsedOptions = parseOptionsString(optionsString);

    const values = {};
    parsedOptions.nodes.chosen.node(values);

    expect(values).toEqual(options.nodes.chosen.node);
    expect(parsedOptions.nodes.chosen.label).toEqual(
      options.nodes.chosen.label
    );
  });

  it('should handle staticOptions', () => {
    const options = {
      nodes: {
        chosen: {
          label: { size: 24 },
          node: { borderColor: 'blue' },
        },
      },
      interaction: { zoomView: true },
    };
    const optionsString = getOptionsString(options);
    const parsedOptions = parseOptionsString(optionsString);
    expect(parsedOptions.interaction).toEqual(options.interaction);
  });

  it('should handle static node options', () => {
    const options = {
      nodes: {
        chosen: {
          label: { size: 24 },
          node: { borderColor: 'blue' },
        },
        color: { background: 'white' },
      },
    };
    const optionsString = getOptionsString(options);
    const parsedOptions = parseOptionsString(optionsString);
    expect(parsedOptions.nodes.color).toEqual(options.nodes.color);
  });
});
