import assert from "node:assert/strict";
import * as VizPackage from "../src/standalone.mjs";

describe("Viz", function() {
  let viz;

  beforeEach(async function() {
    viz = await VizPackage.instance();
  });

  describe("renderFormats", function() {
    it("renders multiple output formats", function() {
      const result = viz.renderFormats("graph a { }", ["dot", "cmapx"]);

      assert.deepStrictEqual(result, {
        status: "success",
        output: {
          dot: "graph a {\n\tgraph [bb=\"0,0,0,0\"];\n\tnode [label=\"\\N\"];\n}\n",
          cmapx: "<map id=\"a\" name=\"a\">\n</map>\n"
        },
        errors: []
      });
    });

    it("renders with the same format twice", function() {
      const result = viz.renderFormats("graph a { }", ["dot", "dot"]);

      assert.deepStrictEqual(result, {
        status: "success",
        output: {
          dot: "graph a {\n\tgraph [bb=\"0,0,0,0\"];\n\tnode [label=\"\\N\"];\n}\n"
        },
        errors: []
      });
    });

    it("renders with an empty array of formats", function() {
      const result = viz.renderFormats("graph a { }", []);

      assert.deepStrictEqual(result, {
        status: "success",
        output: {},
        errors: []
      });
    });

    it("accepts options", function() {
      const result = viz.renderFormats("graph a { b }", ["dot", "cmapx"], { engine: "neato", reduce: true });

      assert.deepStrictEqual(result, {
        status: "success",
        output: {
          dot: "graph a {\n\tgraph [bb=\"0,0,0,0\"];\n\tnode [label=\"\\N\"];\n}\n",
          cmapx: "<map id=\"a\" name=\"a\">\n</map>\n"
        },
        errors: []
      });
    });

    it("returns error messages for invalid input", function() {
      const result = viz.renderFormats("invalid", ["dot", "cmapx"]);

      assert.deepStrictEqual(result, {
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "syntax error in line 1 near 'invalid'" }
        ]
      });
    });

    it("returns error messages for invalid input and an empty array of formats", function() {
      const result = viz.renderFormats("invalid", []);

      assert.deepStrictEqual(result, {
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "syntax error in line 1 near 'invalid'" }
        ]
      });
    });
  });
});
