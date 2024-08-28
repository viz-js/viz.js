import { instance } from "../../src/standalone.mjs";
import { randomGraph, dotStringify } from "./utils.mjs";

const invalidInput = "graph {";

function makeObject() {
  return randomGraph(100, 10);
}

function makeObjectWithLabels() {
  const graph = randomGraph(100, 10);
  graph.nodes.forEach(node => {
    node.attributes = { label: `${node.name}!` };
  });
  return graph;
}

function makeObjectWithHTMLLabels() {
  const graph = randomGraph(100, 10);
  graph.nodes.forEach(node => {
    node.attributes = { label: { html: `<b>${node.name}</b>` } };
  });
  return graph;
}

function makeMultiple() {
  return `${dotStringify(makeObject())}${dotStringify(makeObject())}`;
}

const tests = [
  { label: "string", fn: viz => viz.render(dotStringify(makeObject())) },
  { label: "string with labels", fn: viz => viz.render(dotStringify(makeObjectWithLabels())) },
  { label: "string with HTML labels", fn: viz => viz.render(dotStringify(makeObjectWithHTMLLabels())) },
  { label: "string with multiple formats", fn: viz => viz.renderFormats(dotStringify(makeObject()), ["svg", "cmapx"]) },
  { label: "object", fn: viz => viz.render(makeObject()) },
  { label: "object with labels", fn: viz => viz.render(makeObjectWithLabels()) },
  { label: "object with HTML labels", fn: viz => viz.render(makeObjectWithHTMLLabels()) },
  { label: "valid input containing multiple graphs", fn: viz => viz.render(makeMultiple()) },
  { label: "invalid input", fn: viz => viz.render(invalidInput) },
  { label: "invalid layout engine option", fn: viz => viz.render(dotStringify(makeObject()), { engine: "invalid" }) },
  { label: "invalid format option", fn: viz => viz.render(dotStringify(makeObject()), { format: "invalid" }) },
  { label: "list layout engines", fn: viz => viz.engines },
  { label: "list formats", fn: viz => viz.formats }
];

for (const { label, fn } of tests) {
  const viz = await instance();

  console.log(label);

  let previous = 0;

  for (let i = 0; i < 10000; i++) {
    const result = fn(viz);

    const current = process.memoryUsage.rss();

    if (i % 1000 == 999) {
      console.log(`output length: ${result.output?.length}, count: ${i+1}`, `rss: ${current}`, previous > 0 ? `change: ${current - previous}` : "");
      previous = current;
    }
  }
}
