import ReactorSheetApp from "@src/ReactorSheet";
import ReactApplication from "./react-application";

class ReactorSheet extends ReactApplication {
  reactApp = ReactorSheetApp;
  static DEFAULT_OPTIONS = {
    window: {
      title: "Reactor Sheet",
    },
    position: {
      width: 600,
      height: 800,
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    console.log(context, options);
    // You can add additional context data here if needed
    context.rootId = this.rootId;
    context.initialProps = {
      actor: context.document,
      source: context.source,
    };
    return context;
  }
}

export default ReactorSheet;
