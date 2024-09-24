import { parseStderrMessages, parseAgerrMessages } from "./errors.mjs";

class Wrapper {
  constructor(module) {
    this.module = module;
  }

  getGraphvizVersion() {
    const resultPointer = this.module.ccall("viz_get_graphviz_version", "number", [], []);
    return this.module.UTF8ToString(resultPointer);
  }

  getPluginList(kind) {
    const resultPointer = this.module.ccall("viz_get_plugin_list", "number", ["string"], [kind]);

    if (resultPointer == 0) {
      throw new Error(`couldn't get plugin list: ${kind}`);
    }

    const list = [];
    let itemPointer = resultPointer;
    let stringPointer;

    while (stringPointer = this.module.getValue(itemPointer, "*")) {
      list.push(this.module.UTF8ToString(stringPointer));
      this.module.ccall("free", "number", ["number"], [stringPointer]);
      itemPointer += 4;
    }

    this.module.ccall("free", "number", ["number"], [resultPointer]);

    return list;
  }

  renderInput(input, options) {
    let graphPointer, resultPointer, imageFilePaths;

    try {
      this.module["agerrMessages"] = [];
      this.module["stderrMessages"] = [];

      imageFilePaths = this.#createImageFiles(options.images);

      if (typeof input === "string") {
        graphPointer = this.#readStringInput(input, options);
      } else if (typeof input === "object") {
        graphPointer = this.#readObjectInput(input, options);
      } else {
        throw new Error("input must be a string or object");
      }

      if (graphPointer === 0) {
        return {
          status: "failure",
          output: undefined,
          errors: this.#parseErrorMessages()
        };
      }

      this.#setDefaultAttributes(graphPointer, options);

      this.module.ccall("viz_set_y_invert", "number", ["number"], [options.yInvert ? 1 : 0]);
      this.module.ccall("viz_set_reduce", "number", ["number"], [options.reduce ? 1 : 0]);

      resultPointer = this.module.ccall("viz_render_graph", "number", ["number", "string", "string"], [graphPointer, options.format, options.engine]);

      if (resultPointer === 0) {
        return {
          status: "failure",
          output: undefined,
          errors: this.#parseErrorMessages()
        };
      }

      return {
        status: "success",
        output: this.module.UTF8ToString(resultPointer),
        errors: this.#parseErrorMessages()
      };
    } catch (error) {
      if (/^exit\(\d+\)/.test(error)) {
        return {
          status: "failure",
          output: undefined,
          errors: this.#parseErrorMessages()
        };
      } else {
        throw error;
      }
    } finally {
      if (graphPointer) {
        this.module.ccall("viz_free_graph", "number", ["number"], [graphPointer]);
      }

      if (resultPointer) {
        this.module.ccall("free", "number", ["number"], [resultPointer]);
      }

      if (imageFilePaths) {
        this.#removeImageFiles(imageFilePaths);
      }
    }
  }

  #parseErrorMessages() {
    return parseAgerrMessages(this.module["agerrMessages"]).concat(parseStderrMessages(this.module["stderrMessages"]));
  }

  #createImageFiles(images) {
    if (!images) {
      return [];
    }

    return images.map(image => {
      if (typeof image.name !== "string") {
        throw new Error("image name must be a string");
      } else if (typeof image.width !== "number" && typeof image.width !== "string") {
        throw new Error("image width must be a number or string");
      } else if (typeof image.height !== "number" && typeof image.height !== "string") {
        throw new Error("image height must be a number or string");
      }

      const path = this.module.PATH.join("/", image.name);
      const data = `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${image.width}" height="${image.height}"></svg>
  `;

      this.module.FS.createPath("/", this.module.PATH.dirname(path));
      this.module.FS.writeFile(path, data);

      return path;
    });
  }

  #removeImageFiles(imageFilePaths) {
    for (const path of imageFilePaths) {
      if (this.module.FS.analyzePath(path).exists) {
        this.module.FS.unlink(path);
      }
    }
  }

  #readStringInput(src, options) {
    let srcPointer;

    try {
      const srcLength = this.module.lengthBytesUTF8(src);
      srcPointer = this.module.ccall("malloc", "number", ["number"], [srcLength + 1]);
      this.module.stringToUTF8(src, srcPointer, srcLength + 1);

      return this.module.ccall("viz_read_one_graph", "number", ["number"], [srcPointer]);
    } finally {
      if (srcPointer) {
        this.module.ccall("free", "number", ["number"], [srcPointer]);
      }
    }
  }

  #readObjectInput(object, options) {
    const graphPointer = this.module.ccall("viz_create_graph", "number", ["string", "number", "number"], [object.name, typeof object.directed !== "undefined" ? object.directed : true, typeof object.strict !== "undefined" ? object.strict : false]);

    this.#readGraph(graphPointer, object);

    return graphPointer;
  }

  #readGraph(graphPointer, graphData) {
    this.#setDefaultAttributes(graphPointer, graphData);

    if (graphData.nodes) {
      graphData.nodes.forEach(nodeData => {
        const nodePointer = this.module.ccall("viz_add_node", "number", ["number", "string"], [graphPointer, String(nodeData.name)]);

        if (nodeData.attributes) {
          this.#setAttributes(graphPointer, nodePointer, nodeData.attributes);
        }
      });
    }

    if (graphData.edges) {
      graphData.edges.forEach(edgeData => {
        const edgePointer = this.module.ccall("viz_add_edge", "number", ["number", "string", "string"], [graphPointer, String(edgeData.tail), String(edgeData.head)]);

        if (edgeData.attributes) {
          this.#setAttributes(graphPointer, edgePointer, edgeData.attributes);
        }
      });
    }

    if (graphData.subgraphs) {
      graphData.subgraphs.forEach(subgraphData => {
        const subgraphPointer = this.module.ccall("viz_add_subgraph", "number", ["number", "string"], [graphPointer, String(subgraphData.name)]);

        this.#readGraph(subgraphPointer, subgraphData);
      });
    }
  }

  #setDefaultAttributes(graphPointer, data) {
    if (data.graphAttributes) {
      for (const [name, value] of Object.entries(data.graphAttributes)) {
        this.#withStringPointer(graphPointer, value, stringPointer => {
          this.module.ccall("viz_set_default_graph_attribute", "number", ["number", "string", "number"], [graphPointer, name, stringPointer]);
        });
      }
    }

    if (data.nodeAttributes) {
      for (const [name, value] of Object.entries(data.nodeAttributes)) {
        this.#withStringPointer(graphPointer, value, stringPointer => {
          this.module.ccall("viz_set_default_node_attribute", "number", ["number", "string", "number"], [graphPointer, name, stringPointer]);
        });
      }
    }

    if (data.edgeAttributes) {
      for (const [name, value] of Object.entries(data.edgeAttributes)) {
        this.#withStringPointer(graphPointer, value, stringPointer => {
          this.module.ccall("viz_set_default_edge_attribute", "number", ["number", "string", "number"], [graphPointer, name, stringPointer]);
        });
      }
    }
  }

  #setAttributes(graphPointer, objectPointer, attributes) {
    for (const [key, value] of Object.entries(attributes)) {
      this.#withStringPointer(graphPointer, value, stringPointer => {
        this.module.ccall("viz_set_attribute", "number", ["number", "string", "number"], [objectPointer, key, stringPointer]);
      });
    }
  }

  #withStringPointer(graphPointer, value, callbackFn) {
    let stringPointer;

    if (typeof value === "object" && "html" in value) {
      stringPointer = this.module.ccall("viz_string_dup_html", "number", ["number", "string"], [graphPointer, String(value.html)]);
    } else {
      stringPointer = this.module.ccall("viz_string_dup", "number", ["number", "string"], [graphPointer, String(value)]);
    }

    if (stringPointer == 0) {
      throw new Error("couldn't dup string");
    }

    callbackFn(stringPointer);

    this.module.ccall("viz_string_free", "number", ["number", "number"], [graphPointer, stringPointer]);
  }
}

export default Wrapper;
