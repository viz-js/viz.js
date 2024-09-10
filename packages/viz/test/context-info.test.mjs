import assert from "node:assert/strict";
import * as VizPackage from "../src/standalone.mjs";

describe("Viz", function() {
  let viz;

  beforeEach(async function() {
    viz = await VizPackage.instance();
  });

  describe("graphvizVersion", function() {
    it("returns the Graphviz version", function() {
      assert.strictEqual(viz.graphvizVersion, "12.1.1");
    });
  });

  describe("formats", function() {
    it("returns the list of formats", function() {
      assert.deepStrictEqual(viz.formats, [
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
      assert.deepStrictEqual(viz.engines, [
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
});
