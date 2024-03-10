import { getOptionsString } from '../OptionsReloader';

function parseOptionsString(optionsString: string) {
  // eslint-disable-next-line no-eval
  return eval(`(${optionsString})`);
}

describe('getOptionsString', () => {
  it('should handle staticOptions', () => {
    const options = {
      edges: { chosen: { label: false, edge: { width: 3 } } },
      nodes: { chosen: { label: { size: 24 }, node: { borderColor: 'blue' } } },
      interaction: { zoomView: true },
    };
    const optionsString = getOptionsString(options);
    const parsedOptions = parseOptionsString(optionsString);
    expect(parsedOptions.interaction).toEqual(options.interaction);
  });

  describe('edges', () => {
    it('handles chosen boolean', () => {
      [false, true].forEach((value) => {
        const options = { edges: { chosen: value } };
        const optionsString = getOptionsString(options);
        expect(parseOptionsString(optionsString)).toEqual(options);
      });
    });

    it('should handle chosen edge and label booleans', () => {
      const cases: [boolean, boolean][] = [
        [false, false],
        [false, true],
        [true, false],
        [true, true],
      ];
      cases.forEach(([label, edge]) => {
        const options = { edges: { chosen: { label, edge } } };
        const optionsString = getOptionsString(options);
        expect(parseOptionsString(optionsString)).toEqual(options);
      });
    });

    it('should handle chosen label ChosenLabelValues object', () => {
      const options = {
        edges: { chosen: { label: { color: 'green', size: 36 }, edge: false } },
      };
      const optionsString = getOptionsString(options);
      const parsedOptions = parseOptionsString(optionsString);

      const values = {};
      parsedOptions.edges.chosen.label(values);

      expect(values).toEqual(options.edges.chosen.label);
      expect(parsedOptions.edges.chosen.edge).toEqual(
        options.edges.chosen.edge
      );
    });

    it('should handle chosen edge ChosenEdgeValues object', () => {
      const options = {
        edges: {
          chosen: { label: false, edge: { color: 'red', shadow: true } },
        },
      };
      const optionsString = getOptionsString(options);
      const parsedOptions = parseOptionsString(optionsString);

      const values = {};
      parsedOptions.edges.chosen.edge(values);

      expect(values).toEqual(options.edges.chosen.edge);
      expect(parsedOptions.edges.chosen.label).toEqual(
        options.edges.chosen.label
      );
    });

    it('should handle static edge options', () => {
      const options = {
        edges: {
          chosen: { label: { size: 24 }, edge: { color: 'blue' } },
          color: 'white',
        },
      };
      const optionsString = getOptionsString(options);
      const parsedOptions = parseOptionsString(optionsString);
      expect(parsedOptions.edges.color).toEqual(options.edges.color);
    });
  });

  describe('nodes', () => {
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
        nodes: { chosen: { label: { color: 'green', size: 36 }, node: false } },
      };
      const optionsString = getOptionsString(options);
      const parsedOptions = parseOptionsString(optionsString);

      const values = {};
      parsedOptions.nodes.chosen.label(values);

      expect(values).toEqual(options.nodes.chosen.label);
      expect(parsedOptions.nodes.chosen.node).toEqual(
        options.nodes.chosen.node
      );
    });

    it('should handle chosen node ChosenNodeValues object', () => {
      const options = {
        nodes: {
          chosen: { label: false, node: { color: 'red', shadow: true } },
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

    it('should handle static node options', () => {
      const options = {
        nodes: {
          chosen: { label: { size: 24 }, node: { borderColor: 'blue' } },
          color: { background: 'white' },
        },
      };
      const optionsString = getOptionsString(options);
      const parsedOptions = parseOptionsString(optionsString);
      expect(parsedOptions.nodes.color).toEqual(options.nodes.color);
    });
  });
});
