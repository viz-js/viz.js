# Changelog

## Unreleased

* Update Graphviz to 12.1.1.
* Update Expat to 2.6.3.

## 3.8.0

* Update Graphviz to 12.1.0.
* Update Emscripten SDK to 3.1.64.

## 3.7.0

* Update Graphviz to 12.0.0.

## 3.6.0

* Update Expat to 2.6.2.

## 3.5.0

* Update Graphviz to 11.0.0.

## 3.4.0

* Update Graphviz to 10.0.1.

## 3.3.1

* Accept "images" entries with duplicate names.

## 3.3.0

* Add support for an images option, similar to the previous version.

  Sizes of images referenced by the image attribute can be specified using an "images" render option:

      viz.render("graph { a[image=\"test.png\"] }", {
        images: [
          { name: "test.png", width: 300, height: 200 }
        ]
      });

  The property "name" is used instead of "path" to match the Graphviz documentation.

## 3.2.4

* Update Emscripten SDK to 3.1.51

* Export the Viz type (#224, #225)

## 3.2.3

* Add a workaround for node names not being used as labels (#218)

## 3.2.2

* Include types condition in exports

## 3.2.1

* Update TypeScript declarations to match API docs

## 3.2.0

* Update Graphviz to 9.0.0.

* Update Emscripten SDK to 3.1.45.

* Collapse default attributes into separate graphAttributes, edgeAttributes, nodeAttributes objects.

  For example, to set the default shape attribute for nodes:

      viz.render("digraph { a -> b }", { nodeAttributes: { shape: "circle" } });
  
  This is equivalent to specifying `-Nshape=circle` in command-line arguments.
  
  Example usage in graph objects:
  
      viz.render({
        graphAttributes: {
          label: "Test"
        },
        nodeAttributes: {
          shape: "circle"
        },
        edges: [
          { tail: "a", head: "b" }
        ]
      });
  
  Equivalent in DOT:
  
      digraph {
        graph [label="Test"]
        node [shape="circle"]
        
        a -> b
      }
      
  Specifying default graph attributes had the same effect as specifying attributes for the graph. This removes that ambiguity.

* Accept HTML attribute values in object input.

  HTML attribute values are written as an object literal with a "html" property:
  
      { label: { html: "<i>the label</i>" } }

* Accept a "reduce" option. This has the same effect as using the -x Graphviz command-line option. When using the neato layout engine, it prunes isolated nodes.

* Accept default attributes for graphs, nodes, and edges in render options. This is similar to the -G, -N, -E options provided by the Graphviz command-line.

  Setting the default shape for nodes:

      viz.render("digraph { a -> b }", { defaultAttributes: { node: { shape: "circle" } } });
  
  These attributes take precedence over default attributes specified in string and object input.

* Accept an object that represents a graph as input for render(). This is a JSON object similar in structure to the Graphviz DOT syntax.

  Rendering with an object:
  
      // DOT: digraph { a -> b }
      viz.render({ directed: true, edges: [{ tail: "a", head: "b" }] });
    
  Another example:
  
      viz.render({
        directed: true,
        defaultAttributes: {
          node: {
            shape: "circle"
          }
        },
        nodes: [
          { name: "a", attributes: { label: "A", color: "red" } },
        ],
        edges: [
          { tail: "a", head: "b" },
        ],
        subgraphs: [
          {
            name: "cluster_1",
            nodes: [
              { name: "b", attributes: { label: "B", color: "blue" } }
            ]
          }
        ]
      });
  
  Edge ports can be specified using the headport and tailport attributes.

* Update Emscripten SDK to 3.1.43.

## 3.1.0

* Update Graphviz to 8.1.0.

* Export the Graphviz version, supported formats, and supported engines as constants generated at build time.

* Include an ES module build as well as UMD.

* Add Typescript declarations.

## 3.0.1

* Catch the error Emscripten throws when exit() is called.

* Don't add an error message about no valid graphs in input.

* Improve error message handling when an error reported from agerr has multiple lines.

## 3.0.0

* Viz.js now uses WebAssembly.

* Adds a new `render()` method that returns the result of rendering, including Graphviz error and warning messages, in a structured format.

* Adds getters for the Graphviz version string, and lists of supported layout engines and output formats.

* Memory leaks that could be identified by calling rendering methods many times have been fixed.

* Can be used as a single JavaScript source file (in UMD format).

* Rendering methods are now synchronous. But constructing an instance of the `Viz` class is now asynchronous, because it depends on compiling and instantiating the WebAssembly code. Use the `instance()` method exported by the main source file, `lib/viz-standalone.js`, which returns a promise that resolves to an instance of the `Viz` class.

* The default value of the `format` option is now `"dot"`, rather than `"svg"`, as with the Graphviz `dot` program. This change only affects the `render()` and `renderString()` methods, since the format for, eg, `renderSVGElement()` is always `"svg"`.

* The `renderJSONObject()` method is now called `renderJSON()`.

* The built-in `Worker` support has been removed.

* The `files` and `images` options have been removed. This allows the Emscripten module to be smaller.

* The `renderImageElement` method has been removed in favor of SVG.

* The `nop` option has been removed. Instead, set the `engine` option to one of `nop`, `nop1`, `nop2`.
