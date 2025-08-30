import { mountApp } from "../util/mountApp";

/**
 * A Foundry VTT Application class that integrates React components with the Foundry application framework.
 * Extends ApplicationV2 to provide seamless React app mounting and rendering capabilities.
 *
 * @class FoundryReactApplication
 * @extends foundry.applications.api.ApplicationV2
 *
 * @example
 * // Create a new React-powered Foundry application
 * const app = new FoundryReactApplication({
 *   reactApp: MyReactComponent,
 *   initialProps: { data: 'example' }
 * });
 *
 * @property {React.Component} reactApp - The React component to be mounted
 * @property {string} template - Path to the Handlebars template for the application shell
 * @property {Object} initialProps - Initial properties passed to the React component
 * @property {string} rootId - ID added to the root element where the React app will be mounted
 */
class ReactApplication extends foundry.applications.sheets.ActorSheetV2 {
  reactApp;
  template = "modules/foundry-react-module-template/templates/react-root.hbs";
  initialProps = {};
  rootId = `react-app-root-${foundry.utils.randomID(8)}`;

  static DEFAULT_OPTIONS = {
    position: {
      width: 400,
      height: 500,
    },
    window: {
      title: "Base class for React-powered Foundry applications",
      resizable: true,
      minimizable: true,
    },
  };

  /**
   * Applications are constructed by providing an object of configuration options.
   * @param {Partial<Configuration>} [options]    Options used to configure the Application instance
   */
  constructor({ reactApp, initialProps, ...options }) {
    super(options);
    console.log(options);
    this.reactApp = reactApp;
  }

  async _onRender(context) {
    await super._onRender(context);
    const el = this.element.querySelectorAll(`#${this.rootId}`);
    if (el && !this.mounted) {
      mountApp(this.reactApp, el[0], context.initialProps);
      this.mounted = true;
    }
  }

  _replaceHTML(result, content, options) {
    console.log(options);
    if (!this.mounted) {
      content.appendChild(result);
    }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    // You can add additional context data here if needed
    context.rootId = this.rootId;
    context.initialProps = this.initialProps;
    return context;
  }

  async _renderHTML(context, options) {
    console.log(context, options);
    const tempEl = document.createElement("div");
    const htmlString = await foundry.applications.handlebars.renderTemplate(
      this.template,
      context
    );
    tempEl.innerHTML = htmlString;
    return tempEl;
  }
}

export default ReactApplication;
