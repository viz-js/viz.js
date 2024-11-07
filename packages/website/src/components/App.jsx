import { useState, useEffect, useMemo, useRef } from "react";
import { debounce } from "lodash-es";
import ReloadablePromiseWorker, { TerminatedError } from "../reloadable-promise-worker.js";
import { copyLink } from "../links.js";
import EditorToolbar from "./EditorToolbar.jsx";
import Editor from "./Editor.jsx";
import OutputToolbar from "./OutputToolbar.jsx";
import Output from "./Output.jsx";
import Errors from "./Errors.jsx";

const worker = new ReloadablePromiseWorker(() => new Worker(new URL("../worker.js", import.meta.url), { type: "module" }));

function render(src, options) {
  let effectiveFormat = options.format == "svg-image" ? "svg" : options.format;

  return worker
    .postMessage({ src, options: { ...options, format: effectiveFormat } })
    .then(result => {
      return { ...result, format: options.format };
    });
}

export default function App({ initialSrc }) {
  const [src, setSrc] = useState(initialSrc);
  const [debouncedSrc, setDebouncedSrc] = useState(src);
  const [options, setOptions] = useState({ engine: "dot", format: "svg-image" });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);
  const [zoom, setZoom] = useState("fit");
  const [isValid, setValid] = useState(false);
  const imageZoomRef = useRef(null);
  const editorRef = useRef(null);

  function handleCopyLink() {
    copyLink(src);
  }

  function handleSrcChange(newSrc) {
    setSrc(newSrc);
    handleSrcChangeDebounced(newSrc);
  }

  function handleOptionChange(k, v) {
    setOptions(o => ({ ...o, [k]: v }));
  }

  function handleLoadExample(example) {
    editorRef.current?.setValue(example);
    setSrc(example);
    setDebouncedSrc(example);
  }

  const handleSrcChangeDebounced = useMemo(() => {
    return debounce(setDebouncedSrc, 750);
  }, []);

  useEffect(() => {
    let ignore = false;

    setValid(false);

    render(debouncedSrc, options)
      .then(nextResult => {
        if (ignore) {
          return;
        }

        if (nextResult.status == "success") {
          setResult(nextResult);
          setValid(true);
        }

        setErrors(nextResult.errors);
      })
      .catch(error => {
        if (!(error instanceof TerminatedError)) {
          setErrors([
            { level: "error", message: error.toString() }
          ]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [debouncedSrc, options]);

  const zoomEnabled = result?.format == "svg-image";

  return (
    <>
      <EditorToolbar onLoadExample={handleLoadExample} onCopyLink={handleCopyLink} />
      <Editor defaultValue={src} onChange={handleSrcChange} ref={editorRef} />
      <OutputToolbar options={options} onOptionChange={handleOptionChange} zoomEnabled={zoomEnabled} zoom={zoom} onZoomChange={setZoom} onZoomIn={() => imageZoomRef.current?.zoomIn()} onZoomOut={() => imageZoomRef.current?.zoomOut()} />
      <Output result={result} zoom={zoom} imageZoomRef={imageZoomRef} onZoomChange={setZoom} isValid={isValid} />
      <Errors errors={errors} />
    </>
  );
}
