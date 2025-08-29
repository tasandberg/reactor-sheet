/**
 * This is a dev-only entry point that enables React with HMR in foundry.
 * Steps:
 * 1. Inject the required "preamble" <script /> for React Refresh into the foundry header
 * 2. Inject the actual entrypoint (main.ts)
 */
import { id as APP_ID } from "../module.json";

function devSetup() {
  const refreshScriptId = "foundry-react-refresh-script";

  if (document.getElementById(refreshScriptId)) {
    console.log("Script tag already exists, not adding again");
    return;
  } else {
    console.log("Adding script tag for react refresh");
    const scriptInner = `
      import { injectIntoGlobalHook } from "/modules/${APP_ID}/dist/@react-refresh";
      injectIntoGlobalHook(window);
      window.$RefreshReg$ = () => {};
      window.$RefreshSig$ = () => (type) => type;
  `;
    const tag = document.createElement("script");
    tag.type = "module";
    tag.id = refreshScriptId;
    tag.innerHTML = scriptInner;
    document.head.prepend(tag);
  }

  const devEntrypointId = "foundry-react-dev-entrypoint";
  if (document.getElementById(devEntrypointId)) {
    console.log("Dev entrypoint script tag already exists, not adding again");
    return;
  } else {
    const mainScript = document.createElement("script");
    mainScript.type = "module";
    mainScript.src = `/modules/${APP_ID}/dist/_main.js`;
    document.body.appendChild(mainScript);
  }
}

devSetup();
