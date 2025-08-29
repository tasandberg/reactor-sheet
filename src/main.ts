import logger from "./util/logger";
import DemoApp from "./components/demo/DemoApp";
import ReactApplication from "@src/applications/react-application";

export function initialize() {
  Hooks.once("init", () => {
    logger("Foundry React Module | Initializing module");
  });

  Hooks.once("ready", async () => {
    logger("Foundry React Module | Initializing React application");
    const demoApp = new ReactApplication({
      reactApp: DemoApp,
      rootId: "demo-application",
      initialProps: {
        message: "Hello, I'm a prop from ApplicationV2",
      },
      window: { title: "React in Foundry demo" },
      resizable: true,
      minimizable: true,
      classes: ["demo-application"],
      width: 500,
      height: 200,
    });

    demoApp.render(true);
  });
}

initialize();
