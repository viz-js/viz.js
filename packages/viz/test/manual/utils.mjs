export function measure(operation, timeLimit) {
  let callCount = 0;

  const startTime = performance.now();

  while (performance.now() - startTime < timeLimit) {
    operation();
    callCount++;
  }

  const stopTime = performance.now();
  const duration = (stopTime - startTime) / 1000;
  const speed = callCount / duration;

  return `${callCount} in ${duration.toFixed(2)} s, ${speed.toFixed(2)} calls/s`
}

const skipQuotePattern = /^([A-Za-z_][A-Za-z_0-9]*|-?(\.[0-9]+|[0-9]+(\.[0-9]+)?))$/;

function quote(value) {
  if (typeof value === "object" && "html" in value) {
    return "<" + value.html + ">";
  }

  const str = String(value);

  if (skipQuotePattern.test(str)) {
    return str;
  } else {
    return "\"" + str.replaceAll("\"", "\\\"").replaceAll("\n", "\\n") + "\"";
  }
}

export function randomGraph(nodeCount, randomEdgeCount = 0) {
  const result = {
    nodes: [],
    edges: []
  };

  const prefix = Math.floor(Number.MAX_SAFE_INTEGER * Math.random());

  for (let i = 0; i < nodeCount; i++) {
    result.nodes.push({ name: `${prefix}-node${i}` });
  }

  for (let i = 0; i < randomEdgeCount; i++) {
    const t = Math.floor(nodeCount * Math.random());
    const h = Math.floor(nodeCount * Math.random());

    result.edges.push({
      tail: result.nodes[t].name,
      head: result.nodes[h].name
    });
  }

  return result;
}

export function dotStringify(obj) {
  const edges = Array.from(obj);
  const result = [];

  result.push("digraph {\n");

  for (const node of obj.nodes) {
    result.push(quote(node.name));

    if (node.attributes) {
      result.push(" [");

      let sep = "";
      for (const [key, value] of Object.entries(node.attributes)) {
        result.push(quote(key), "=", quote(value), sep);
        sep = ", ";
      }

      result.push("]");
    }

    result.push(";\n");
  }

  for (const edge of obj.edges) {
    result.push(quote(edge.tail), " -> ", quote(edge.head));

    if (edge.attributes) {
      result.push(" [");

      let sep = "";
      for (const [key, value] of Object.entries(edge.attributes)) {
        result.push(quote(key), "=", quote(value), sep);
        sep = ", ";
      }

      result.push("]");
    }

    result.push(";\n");
  }

  result.push("}\n");

  return result.join("");
}
