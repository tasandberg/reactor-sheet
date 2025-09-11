import { mountApp } from "../util/mountApp";
import ContextConnector from "./context-connector";
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
    scrollY: [".tabs-content"],
  };

  /**
   * Applications are constructed by providing an object of configuration options.
   * @param {Partial<Configuration>} [options]    Options used to configure the Application instance
   */
  constructor({ reactApp, initialProps, ...options }) {
    super(options);
    this.contextConnector = new ContextConnector();
    this.reactApp = reactApp;
  }

  async _onRender(context) {
    await super._onRender(context);
    const el = this.element.querySelectorAll(`#${this.rootId}`);
    if (el && !this.appIsRendered) {
      mountApp(this.reactApp, el[0], context.initialProps);
    }
    this.contextConnector.publishContext(context);
  }

  get appIsRendered() {
    return !!document.querySelector(`#${this.rootId}`);
  }

  _replaceHTML(result, content, options) {
    if (!this.appIsRendered) {
      content.appendChild(result);
    }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    // You can add additional context data here if needed
    context.rootId = this.rootId;
    context.initialProps = this.initialProps;
    context.app = this;
    return context;
  }

  async _renderHTML(context, options) {
    const tempEl = document.createElement("div");
    tempEl.id = this.rootId;
    const htmlString = await foundry.applications.handlebars.renderTemplate(
      this.template,
      context
    );
    tempEl.innerHTML = htmlString;
    return tempEl;
  }
}

export default ReactApplication;
