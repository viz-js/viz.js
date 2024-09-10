import assert from "node:assert/strict";
import * as VizPackage from "../src/standalone.mjs";
import Viz from "../src/viz.mjs";

describe("graphvizVersion", function() {
  it("returns the Graphviz version", function() {
    assert.strictEqual(VizPackage.graphvizVersion, "12.1.1");
  });
});

describe("formats", function() {
  it("returns the list of formats", function() {
    assert.deepStrictEqual(VizPackage.formats, [
      "canon",
      "cmap",
      "cmapx",
      "cmapx_np",
      "dot",
      "dot_json",
      "eps",
      "fig",
      "gv",
      "imap",
      "imap_np",
      "ismap",
      "json",
      "json0",
      "pic",
      "plain",
      "plain-ext",
      "pov",
      "ps",
      "ps2",
      "svg",
      "svg_inline",
      "tk",
      "xdot",
      "xdot1.2",
      "xdot1.4",
      "xdot_json"
    ]);
  });
});

describe("engines", function() {
  it("returns the list of layout engines", function() {
    assert.deepStrictEqual(VizPackage.engines, [
      "circo",
      "dot",
      "fdp",
      "neato",
      "nop",
      "nop1",
      "nop2",
      "osage",
      "patchwork",
      "sfdp",
      "twopi"
    ]);
  });
});

describe("instance", function() {
  it("returns a promise that resolves to an instance of the Viz class", async function() {
    const viz = await VizPackage.instance();

    assert.ok(viz instanceof Viz);
  });
});
