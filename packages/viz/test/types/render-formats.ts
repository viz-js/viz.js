import { instance, type MultipleRenderResult, type RenderError } from "@viz-js/viz";

instance().then(viz => {
  let result: MultipleRenderResult = viz.renderFormats("digraph { a -> b }", ["svg", "cmapx"]);

  switch (result.status) {
  case "success":
    {
      let output: string = result.output["svg"];
      break;
    }

  case "failure":
    {
      // @ts-expect-error
      let output: string = result.output;
      break;
    }

  // @ts-expect-error
  case "invalid":
    break;
  }

  let error: RenderError | undefined = result.errors[0];

  if (typeof error !== "undefined") {
    let message: string = error.message;

    switch (error.level) {
    case "error":
      break;

    case "warning":
      break;

    case undefined:
      break;

    // @ts-expect-error
    case "invalid":
      break;
    }
  }
});
