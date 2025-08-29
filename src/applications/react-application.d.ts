import type React from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * A Foundry VTT Application class that integrates React components with the Foundry application framework.
 */
declare class ReactApplication extends foundry.applications.api.ApplicationV2 {
  /**
   * The React component to be mounted.
   */
  reactApp: React.ComponentType<any>;

  /**
   * Path to the Handlebars template for the application shell.
   */
  template: string;

  /**
   * Initial properties passed to the React component.
   */
  initialProps: Record<string, any>;

  /**
   * ID added to the root element where the React app will be mounted.
   */
  rootId: string;

  static DEFAULT_OPTIONS: {
    position: {
      width: number;
      height: number;
    };
    window: {
      title: string;
      resizable: boolean;
      minimizable: boolean;
    };
  };

  /**
   * @param options - Options used to configure the Application instance.
   */
  constructor(options: {
    reactApp: React.ComponentType<any>;
    initialProps?: Record<string, any>;
    [key: string]: any;
  });

  protected _onRender(context: any): Promise<void>;

  protected _replaceHTML(
    result: HTMLElement,
    content: HTMLElement,
    options: any
  ): void;

  protected _prepareContext(options: any): Promise<any>;

  protected _renderHTML(context: any, options: any): Promise<HTMLElement>;
}

export default ReactApplication;
