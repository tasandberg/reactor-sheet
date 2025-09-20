/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRoot } from "react-dom/client";

type MountAppProps = {
  App: React.ComponentType<any>;
  element: Element;
  initialProps?: { [key: string]: any };
  innerSelector: string;
};
export function mountApp({
  App,
  element,
  initialProps = {},
  innerSelector,
}: MountAppProps) {
  const root = createRoot(element);
  root.render(
    <div id={innerSelector}>
      <App {...initialProps} />
    </div>
  );
}
