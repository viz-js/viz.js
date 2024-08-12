import assert from "node:assert/strict";
import * as VizPackage from "../src/standalone.mjs";

describe("Viz", function() {
  let viz;

  beforeEach(async function() {
    viz = await VizPackage.instance();
  });

  describe("render", function() {
    it("renders valid input with a single graph", function() {
      const result = viz.render("graph a { }");

      assert.deepStrictEqual(result, {
        status: "success",
        output: "graph a {\n\tgraph [bb=\"0,0,0,0\"];\n\tnode [label=\"\\N\"];\n}\n",
        errors: []
      });
    });

    it("renders valid input with multiple graphs", function() {
      const result = viz.render("graph a { } graph b { }");

      assert.deepStrictEqual(result, {
        status: "success",
        output: "graph a {\n\tgraph [bb=\"0,0,0,0\"];\n\tnode [label=\"\\N\"];\n}\n",
        errors: []
      });
    });

    it("each call renders the first graph in input", function() {
      assert.match(viz.render("graph a { } graph b { } graph c { }").output, /graph a {/);
      assert.match(viz.render("graph d { } graph e { }").output, /graph d {/);
      assert.match(viz.render("graph f { }").output, /graph f {/);
    });

    it("accepts the format option, defaulting to dot", function() {
      assert.match(viz.render("digraph { a -> b }").output, /pos="/);
      assert.match(viz.render("digraph { a -> b }", { format: "dot" }).output, /pos="/);
      assert.match(viz.render("digraph { a -> b }", { format: "xdot" }).output, /_draw_="/);
      assert.match(viz.render("digraph { a -> b }", { format: "svg" }).output, /<svg/);
      assert.match(viz.render("digraph { a -> b }", { format: "json" }).output, /"name": "a"/);
    });

    it("accepts other engine options", function() {
      const src = "digraph { a -> b }";
      const dotOutput = viz.render(src).output;

      assert.strictEqual(viz.render(src, { engine: "dot" }).output, dotOutput);
      assert.notStrictEqual(viz.render(src, { engine: "neato" }).output, dotOutput);
      assert.notStrictEqual(viz.render(src, { engine: "nop2" }).output, dotOutput);
      assert.notStrictEqual(viz.render(src, { engine: "twopi" }).output, dotOutput);
      assert.notStrictEqual(viz.render(src, { engine: "circo" }).output, dotOutput);
      assert.notStrictEqual(viz.render(src, { engine: "fdp" }).output, dotOutput);
      assert.notStrictEqual(viz.render(src, { engine: "sfdp" }).output, dotOutput);
      assert.notStrictEqual(viz.render(src, { engine: "patchwork" }).output, dotOutput);
      assert.notStrictEqual(viz.render(src, { engine: "osage" }).output, dotOutput);
    });

    it("accepts yInvert option", function() {
      const result1 = viz.render("graph { a }", { yInvert: false });
      const result2 = viz.render("graph { a }", { yInvert: true });

      assert.deepStrictEqual(result1, {
        status: "success",
        output: "graph {\n\tgraph [bb=\"0,0,54,36\"];\n\tnode [label=\"\\N\"];\n\ta\t[height=0.5,\n\t\tpos=\"27,18\",\n\t\twidth=0.75];\n}\n",
        errors: []
      });

      assert.deepStrictEqual(result2, {
        status: "success",
        output: "graph {\n\tgraph [bb=\"0,36,54,0\"];\n\tnode [label=\"\\N\"];\n\ta\t[height=0.5,\n\t\tpos=\"27,18\",\n\t\twidth=0.75];\n}\n",
        errors: []
      });
    });

    it("accepts reduce option", function() {
      const result = viz.render("graph { a }", { engine: "neato", reduce: true });

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph {
	graph [bb="0,0,0,0"];
	node [label="\\N"];
}
`,
        errors: []
      });
    });

    it("accepts default attributes", function() {
      const result = viz.render("graph {}", {
        graphAttributes: {
          a: 123
        },
        nodeAttributes: {
          b: false
        },
        edgeAttributes: {
          c: "test"
        }
      });

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph {
	graph [a=123,
		bb="0,0,0,0"
	];
	node [b=false,
		label="\\N"
	];
	edge [c=test];
}
`,
        errors: []
      });
    });

    it("default attribute values can be html strings", function() {
      const result = viz.render("graph {}", {
        nodeAttributes: {
          label: { html: "<b>test</b>" }
        }
      });

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph {
	graph [bb="0,0,0,0"];
	node [label=<<b>test</b>>];
}
`,
        errors: []
      });
    });

    it("returns an error for empty input", function() {
      const result = viz.render("");

      assert.deepStrictEqual(result, {
        status: "failure",
        output: undefined,
        errors: []
      });
    });

    it("returns error messages for invalid input", function() {
      const result = viz.render("invalid");

      assert.deepStrictEqual(result, {
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "syntax error in line 1 near 'invalid'" }
        ]
      });
    });

    it("throws if input is the wrong type", function() {
      assert.throws(() => { viz.render(undefined); }, /^Error: input must be a string or object/);
    });

    it("returns only the error messages emitted for the current call", function() {
      const result1 = viz.render("invalid1");
      const result2 = viz.render("invalid2");

      assert.deepStrictEqual(result1, {
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "syntax error in line 1 near 'invalid1'" }
        ]
      });

      assert.deepStrictEqual(result2, {
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "syntax error in line 1 near 'invalid2'" }
        ]
      });
    });

    it("renders valid input but includes error messges when followed by a graph with a syntax error", function() {
      const result = viz.render("graph a { } graph {");

      assert.deepStrictEqual(result, {
        status: "success",
        output: "graph a {\n\tgraph [bb=\"0,0,0,0\"];\n\tnode [label=\"\\N\"];\n}\n",
        errors: [
          { level: "error", message: "syntax error in line 1" }
        ]
      });
    });

    it("returns error messages for layout errors", function() {
      const result = viz.render("graph a { layout=invalid } graph b { layout=dot }");

      assert.deepStrictEqual(result, {
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "Layout type: \"invalid\" not recognized. Use one of: circo dot fdp neato nop nop1 nop2 osage patchwork sfdp twopi" }
        ]
      });
    });

    it("renders graphs with syntax warnings", function() {
      const result = viz.render("graph a { x=1.2.3=y } graph b { }");

      assert.deepStrictEqual(result, {
        status: "success",
        output: "graph a {\n\tgraph [.3=y,\n\t\tbb=\"0,0,0,0\",\n\t\tx=1.2\n\t];\n\tnode [label=\"\\N\"];\n}\n",
        errors: [
          { level: "warning", message: "syntax ambiguity - badly delimited number '1.2.' in line 1 of input splits into two tokens" }
        ]
      });
    });

    it("returns both warnings and errors", function() {
      const result = viz.render("graph { layout=invalid; x=1.2.3=y }");

      assert.deepStrictEqual(result, {
        status: "failure",
        output: undefined,
        errors: [
          { level: "warning", message: "syntax ambiguity - badly delimited number '1.2.' in line 1 of input splits into two tokens" },
          { level: "error", message: "Layout type: \"invalid\" not recognized. Use one of: circo dot fdp neato nop nop1 nop2 osage patchwork sfdp twopi" }
        ]
      });
    });

    it("returns error messages printed to stderr", function() {
      const result = viz.render("graph { a [label=図] }", { format: "plain" });

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph 1 0.75 0.5
node a 0.375 0.25 0.75 0.5 図 solid ellipse black lightgrey
stop
`,
        errors: [
          { level: "warning", message: "Warning: no value for width of non-ASCII character 229. Falling back to width of space character" }
        ]
      });
    });

    it("returns error messages for invalid engine option", function() {
      const result = viz.render("graph { }", { engine: "invalid" });

      assert.deepStrictEqual(result, {
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "Layout type: \"invalid\" not recognized. Use one of: circo dot fdp neato nop nop1 nop2 osage patchwork sfdp twopi" }
        ]
      });
    });

    it("returns error messages for invalid format option", function() {
      const result = viz.render("graph { }", { format: "invalid" });

      assert.deepStrictEqual(result,{
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "Format: \"invalid\" not recognized. Use one of: canon cmap cmapx cmapx_np dot dot_json eps fig gv imap imap_np ismap json json0 pic plain plain-ext pov ps ps2 svg svg_inline tk xdot xdot1.2 xdot1.4 xdot_json" }
        ]
      });
    });

    it("returns an error that contains newlines as a single item", function() {
      const result = viz.render("graph { \" }");

      assert.deepStrictEqual(result,{
        status: "failure",
        output: undefined,
        errors: [
          { level: "error", message: "syntax error in line 1 scanning a quoted string (missing endquote? longer than 16384?)\nString starting:\" }" }
        ]
      });
    });

    it("returns an error that uses AGPREV with the correct level", function() {
      const result = viz.render("graph { _background=123 }");

      assert.deepStrictEqual(result,{
        status: "success",
        output: "graph {\n\tgraph [_background=123,\n\t\tbb=\"0,0,0,0\"\n\t];\n\tnode [label=\"\\N\"];\n}\n",
        errors: [
          { level: "warning", message: "Could not parse \"_background\" attribute in graph %1" },
          { level: "warning", message: "  \"123\"" }
        ]
      });
    });

    it("the graph is read with the default node label set", function() {
      const result = viz.render("graph { a; b[label=test] }");

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph {
	graph [bb="0,0,126,36"];
	node [label="\\N"];
	a	[height=0.5,
		pos="27,18",
		width=0.75];
	b	[height=0.5,
		label=test,
		pos="99,18",
		width=0.75];
}
`,
        errors: []
      });
    });

    it("accepts an images option", function() {
      const result = viz.render("graph { a[image=\"test.png\"] }", {
        images: [
          { name: "test.png", width: 300, height: 200 }
        ]
      });

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph {
	graph [bb="0,0,321.03,214.96"];
	node [label="\\N"];
	a	[height=2.9856,
		image="test.png",
		pos="160.51,107.48",
		width=4.4587];
}
`,
        errors: []
      });
    });

    it("accepts two images with the same name", function() {
      const result = viz.render("graph { a[image=\"test.png\"] }", {
        images: [
          { name: "test.png", width: 300, height: 200 },
          { name: "test.png", width: 300, height: 200 }
        ]
      });

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph {
	graph [bb="0,0,321.03,214.96"];
	node [label="\\N"];
	a	[height=2.9856,
		image="test.png",
		pos="160.51,107.48",
		width=4.4587];
}
`,
        errors: []
      });
    });

    it("the same image can be used twice", function() {
      const result = viz.render("graph { a[image=\"test.png\"]; b[image=\"test.png\"] }", {
        images: [
          { name: "test.png", width: 300, height: 200 }
        ]
      });

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph {
	graph [bb="0,0,660.03,214.96"];
	node [label="\\N"];
	a	[height=2.9856,
		image="test.png",
		pos="160.51,107.48",
		width=4.4587];
	b	[height=2.9856,
		image="test.png",
		pos="499.51,107.48",
		width=4.4587];
}
`,
        errors: []
      });
    });

    it("accepts URLs for image names", function() {
      const result = viz.render("graph { a[image=\"http://example.com/test.png\"] }", {
        images: [
          { name: "http://example.com/test.png", width: 300, height: 200 }
        ]
      });

      assert.deepStrictEqual(result, {
        status: "success",
        output: `graph {
	graph [bb="0,0,321.03,214.96"];
	node [label="\\N"];
	a	[height=2.9856,
		image="http://example.com/test.png",
		pos="160.51,107.48",
		width=4.4587];
}
`,
        errors: []
      });
    });

    it("throws for invalid image objects", function() {
      assert.throws(() => viz.render("...", { images: [{ src: "test.png", width: 123, height: 456 }] }), /image name/);
      assert.throws(() => viz.render("...", { images: [{ name: "test.png", height: 123 }] }), /image width/);
      assert.throws(() => viz.render("...", { images: [{ name: "test.png", width: 456 }] }), /image height/);
      assert.throws(() => viz.render("...", { images: ["test.png"] }), /image name/);
    });
  });
});
