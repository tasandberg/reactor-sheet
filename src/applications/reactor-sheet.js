import ReactorSheetApp from "@src/ReactorSheet";
import ReactApplication from "./react-application";

class ReactorSheet extends ReactApplication {
  reactApp = ReactorSheetApp;
  static DEFAULT_OPTIONS = {
    window: {
      title: "Reactor Sheet",
      minimizable: true,
      resizable: true,
    },
    tag: "div",
    classes: ["reactor-sheet"],
    position: {
      width: 625,
      height: 750,
    },
    actions: {
      editImage: ReactorSheet.#onEditImage,
    },
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    // You can add additional context data here if needed
    context.rootId = this.rootId;
    context.initialProps = {
      actor: context.document,
      source: context.source,
      contextConnector: this.contextConnector,
    };
    return context;
  }

  static async #onEditImage(e, target) {
    if (target.nodeName !== "IMG") {
      throw new Error(
        "The editImage action is available only for IMG elements."
      );
    }
    const attr = target.dataset.edit;
    const current = foundry.utils.getProperty(this.document._source, attr);
    const defaultArtwork =
      this.document.constructor.getDefaultArtwork?.(this.document._source) ??
      {};
    const defaultImage = foundry.utils.getProperty(defaultArtwork, attr);
    const fp = new foundry.applications.apps.FilePicker.implementation({
      current,
      type: "image",
      redirectToRoot: defaultImage ? [defaultImage] : [],
      callback: (path) => {
        console.log("Selected image path:", attr, path);
        this.document.update({ [attr]: path });
      },
      position: {
        top: this.position.top + 40,
        left: this.position.left + 10,
      },
    });
    await fp.browse();
  }
}

export default ReactorSheet;
