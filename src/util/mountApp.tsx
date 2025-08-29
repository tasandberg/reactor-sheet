import { createRoot } from "react-dom/client";

export function mountApp(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  App: React.ComponentType<any>,
  element: Element,
  initialProps = {}
) {
  console.log("Mounting React app", { App, element, initialProps });
  const root = createRoot(element);
  root.render(<App {...initialProps} />);
}
