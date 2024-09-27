import { getGraphvizVersion, getPluginList, renderInput } from "./wrapper.mjs";

class Viz {
  constructor(module) {
    this.module = module;
  }

  get graphvizVersion() {
    return getGraphvizVersion(this.module);
  }

  get formats() {
    return getPluginList(this.module, "device");
  }

  get engines() {
    return getPluginList(this.module, "layout");
  }

  renderFormats(input, formats, options = {}) {
    return renderInput(this.module, input, formats, { engine: "dot", ...options });
  }

  render(input, options = {}) {
    let format;

    if (options.format === void 0) {
      format = "dot";
    } else {
      format = options.format;
    }

    let result = renderInput(this.module, input, [format], { engine: "dot", ...options });

    if (result.status === "success") {
      result.output = result.output[format];
    }

    return result;
  }

  renderString(src, options = {}) {
    const result = this.render(src, options);

    if (result.status !== "success") {
      throw new Error(result.errors.find(e => e.level == "error")?.message || "render failed");
    }

    return result.output;
  }

  renderSVGElement(src, options = {}) {
    const str = this.renderString(src, { ...options, format: "svg" });
    const parser = new DOMParser();
    return parser.parseFromString(str, "image/svg+xml").documentElement;
  }

  renderJSON(src, options = {}) {
    const str = this.renderString(src, { ...options, format: "json" });
    return JSON.parse(str);
  }
}

export default Viz;
