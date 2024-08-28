import { instance, type Viz, type RenderResult, type MultipleRenderResult } from "@viz-js/viz";

export function myRender(viz: Viz, src: string): string {
  return viz.renderString(src, { graphAttributes: { label: "My graph" } });
}

instance().then(viz => {
  viz.render("digraph { a -> b }");

  viz.render("digraph { a -> b }", { format: "svg" });

  viz.render("digraph { a -> b }", { format: "svg", engine: "dot", yInvert: false });

  viz.renderFormats("digraph { a -> b }", ["svg", "cmapx"]);

  viz.renderFormats("digraph { a -> b }", ["svg", "cmapx"], { engine: "dot" });

  viz.render("digraph { a -> b }", { nodeAttributes: { shape: "circle" } });

  viz.render({ edges: [{ tail: "a", head: "b" }] });

  myRender(viz, "digraph { a -> b }");

  // @ts-expect-error
  viz.render("digraph { a -> b }", { format: false });

  // @ts-expect-error
  viz.render("digraph { a -> b }", { engine: 123 });

  // @ts-expect-error
  viz.render("digraph { a -> b }", { yInvert: 1 });

  // @ts-expect-error
  viz.render("digraph { a -> b }", { whatever: 123 });

  // @ts-expect-error
  viz.render("digraph { a -> b }", { format: ["svg"] });

  let result: RenderResult = viz.render("digraph { a -> b }");

  let formatsResult: MultipleRenderResult = viz.renderFormats("digraph { a -> b }", ["svg", "cmapx"]);

  let stringResult: string = viz.renderString("digraph { a -> b }");

  let svgElementResult: SVGSVGElement = viz.renderSVGElement("digraph { a -> b }");

  let version: string = viz.graphvizVersion;

  let supportedEngines: Array<string> = viz.engines;

  let supportedFormats: Array<string> = viz.formats;
});
