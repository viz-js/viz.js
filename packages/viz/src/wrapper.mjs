import { parseStderrMessages, parseAgerrMessages } from "./errors.mjs";

export function getGraphvizVersion(module) {
  const resultPointer = module.ccall("viz_get_graphviz_version", "number", [], []);
  return module.UTF8ToString(resultPointer);
}

export function getPluginList(module, kind) {
  const resultPointer = module.ccall("viz_get_plugin_list", "number", ["string"], [kind]);

  if (resultPointer == 0) {
    throw new Error(`couldn't get plugin list: ${kind}`);
  }

  const list = [];
  let itemPointer = resultPointer;
  let stringPointer;

  while (stringPointer = module.getValue(itemPointer, "*")) {
    list.push(module.UTF8ToString(stringPointer));
    module.ccall("free", "number", ["number"], [stringPointer]);
    itemPointer += 4;
  }

  module.ccall("free", "number", ["number"], [resultPointer]);

  return list;
}

export function renderInput(module, input, formats, options) {
  let graphPointer, contextPointer, resultPointer, imageFilePaths;

  try {
    module["agerrMessages"] = [];
    module["stderrMessages"] = [];

    imageFilePaths = createImageFiles(module, options.images);

    if (typeof input === "string") {
      graphPointer = readStringInput(module, input, options);
    } else if (typeof input === "object") {
      graphPointer = readObjectInput(module, input, options);
    } else {
      throw new Error("input must be a string or object");
    }

    if (graphPointer === 0) {
      return {
        status: "failure",
        output: undefined,
        errors: parseErrorMessages(module)
      };
    }

    setDefaultAttributes(module, graphPointer, options);

    module.ccall("viz_set_y_invert", "number", ["number"], [options.yInvert ? 1 : 0]);
    module.ccall("viz_set_reduce", "number", ["number"], [options.reduce ? 1 : 0]);

    contextPointer = module.ccall("viz_create_context");

    module.ccall("viz_reset_errors");

    let layoutError = module.ccall("viz_layout", "number", ["number", "number", "string"], [contextPointer, graphPointer, options.engine]);

    if (layoutError !== 0) {
      return {
        status: "failure",
        output: undefined,
        errors: parseErrorMessages(module)
      };
    }

    let output = {};

    for (let format of formats) {
      resultPointer = module.ccall("viz_render", "number", ["number", "number", "string"], [contextPointer, graphPointer, format]);

      if (resultPointer === 0) {
        return {
          status: "failure",
          output: undefined,
          errors: parseErrorMessages(module)
        };
      } else {
        output[format] = module.UTF8ToString(resultPointer);

        module.ccall("free", "number", ["number"], [resultPointer]);
        resultPointer = 0;
      }
    }

    return {
      status: "success",
      output: output,
      errors: parseErrorMessages(module)
    };
  } catch (error) {
    if (/^exit\(\d+\)/.test(error)) {
      return {
        status: "failure",
        output: undefined,
        errors: parseErrorMessages(module)
      };
    } else {
      throw error;
    }
  } finally {
    if (contextPointer && graphPointer) {
      module.ccall("viz_free_layout", "number", ["number"], [contextPointer, graphPointer]);
    }

    if (graphPointer) {
      module.ccall("viz_free_graph", "number", ["number"], [graphPointer]);
    }

    if (contextPointer) {
      module.ccall("viz_free_context", "number", ["number"], [contextPointer]);
    }

    if (resultPointer) {
      module.ccall("free", "number", ["number"], [resultPointer]);
    }

    if (imageFilePaths) {
      removeImageFiles(module, imageFilePaths);
    }
  }
}

function parseErrorMessages(module) {
  return parseAgerrMessages(module["agerrMessages"]).concat(parseStderrMessages(module["stderrMessages"]));
}

function createImageFiles(module, images) {
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

    const path = module.PATH.join("/", image.name);
    const data = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${image.width}" height="${image.height}"></svg>
`;

    module.FS.createPath("/", module.PATH.dirname(path));
    module.FS.writeFile(path, data);

    return path;
  });
}

function removeImageFiles(module, imageFilePaths) {
  for (const path of imageFilePaths) {
    if (module.FS.analyzePath(path).exists) {
      module.FS.unlink(path);
    }
  }
}

function readStringInput(module, src, options) {
  let srcPointer;

  try {
    const srcLength = module.lengthBytesUTF8(src);
    srcPointer = module.ccall("malloc", "number", ["number"], [srcLength + 1]);
    module.stringToUTF8(src, srcPointer, srcLength + 1);

    return module.ccall("viz_read_one_graph", "number", ["number"], [srcPointer]);
  } finally {
    if (srcPointer) {
      module.ccall("free", "number", ["number"], [srcPointer]);
    }
  }
}

function readObjectInput(module, object, options) {
  const graphPointer = module.ccall("viz_create_graph", "number", ["string", "number", "number"], [object.name, typeof object.directed !== "undefined" ? object.directed : true, typeof object.strict !== "undefined" ? object.strict : false]);

  readGraph(module, graphPointer, object);

  return graphPointer;
}

function readGraph(module, graphPointer, graphData) {
  setDefaultAttributes(module, graphPointer, graphData);

  if (graphData.nodes) {
    graphData.nodes.forEach(nodeData => {
      const nodePointer = module.ccall("viz_add_node", "number", ["number", "string"], [graphPointer, String(nodeData.name)]);

      if (nodeData.attributes) {
        setAttributes(module, graphPointer, nodePointer, nodeData.attributes);
      }
    });
  }

  if (graphData.edges) {
    graphData.edges.forEach(edgeData => {
      const edgePointer = module.ccall("viz_add_edge", "number", ["number", "string", "string"], [graphPointer, String(edgeData.tail), String(edgeData.head)]);

      if (edgeData.attributes) {
        setAttributes(module, graphPointer, edgePointer, edgeData.attributes);
      }
    });
  }

  if (graphData.subgraphs) {
    graphData.subgraphs.forEach(subgraphData => {
      const subgraphPointer = module.ccall("viz_add_subgraph", "number", ["number", "string"], [graphPointer, String(subgraphData.name)]);

      readGraph(module, subgraphPointer, subgraphData);
    });
  }
}

function setDefaultAttributes(module, graphPointer, data) {
  if (data.graphAttributes) {
    for (const [name, value] of Object.entries(data.graphAttributes)) {
      withStringPointer(module, graphPointer, value, stringPointer => {
        module.ccall("viz_set_default_graph_attribute", "number", ["number", "string", "number"], [graphPointer, name, stringPointer]);
      });
    }
  }

  if (data.nodeAttributes) {
    for (const [name, value] of Object.entries(data.nodeAttributes)) {
      withStringPointer(module, graphPointer, value, stringPointer => {
        module.ccall("viz_set_default_node_attribute", "number", ["number", "string", "number"], [graphPointer, name, stringPointer]);
      });
    }
  }

  if (data.edgeAttributes) {
    for (const [name, value] of Object.entries(data.edgeAttributes)) {
      withStringPointer(module, graphPointer, value, stringPointer => {
        module.ccall("viz_set_default_edge_attribute", "number", ["number", "string", "number"], [graphPointer, name, stringPointer]);
      });
    }
  }
}

function setAttributes(module, graphPointer, objectPointer, attributes) {
  for (const [key, value] of Object.entries(attributes)) {
    withStringPointer(module, graphPointer, value, stringPointer => {
      module.ccall("viz_set_attribute", "number", ["number", "string", "number"], [objectPointer, key, stringPointer]);
    });
  }
}

function withStringPointer(module, graphPointer, value, callbackFn) {
  let stringPointer;

  if (typeof value === "object" && "html" in value) {
    stringPointer = module.ccall("viz_string_dup_html", "number", ["number", "string"], [graphPointer, String(value.html)]);
  } else {
    stringPointer = module.ccall("viz_string_dup", "number", ["number", "string"], [graphPointer, String(value)]);
  }

  if (stringPointer == 0) {
    throw new Error("couldn't dup string");
  }

  callbackFn(stringPointer);

  module.ccall("viz_string_free", "number", ["number", "number"], [graphPointer, stringPointer]);
}
