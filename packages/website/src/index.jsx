import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./components/App.jsx";
import { getInputFromSearch } from "./links.js";
import { getExample, defaultExampleName } from "./examples.js";

const initialSrc = getInputFromSearch(window.location.search, getExample(defaultExampleName));

const root = createRoot(document.getElementById("app"));
root.render(
  <StrictMode>
    <App initialSrc={initialSrc} />
  </StrictMode>
);
