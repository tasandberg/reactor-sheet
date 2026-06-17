import ReactorSheetApp from "@src/ReactorSheet";
import { resolveTheme, applyTheme } from "@src/ReactorSheet/theme";

import { ReactActorSheetV2 } from "foundry-vtt-react";

class ReactorSheet extends ReactActorSheetV2 {
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

  static registerSettings() {
    game.settings.register("reactor-sheet", "theme", {
      name: "Sheet theme",
      hint: "Color theme for the Re-Actor character sheet.",
      scope: "client",
      config: true,
      type: String,
      choices: { dark: "Dark", cream: "Cream" },
      default: "dark",
      onChange: () => {
        for (const app of foundry.applications.instances.values()) {
          if (app instanceof ReactorSheet) app.render();
        }
      },
    });
  }

  async _onRender(context, options) {
    await super._onRender(context, options);
    const theme = resolveTheme(game.settings.get("reactor-sheet", "theme"));
    applyTheme(this.element, theme);
    // Accent by kind: retainers/hirelings (system.retainer.enabled) go teal;
    // everyone else keeps the brass --gold. See styles.scss [data-kind].
    this.element.dataset.kind = this.document?.system?.retainer?.enabled
      ? "hireling"
      : "pc";
  }

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
