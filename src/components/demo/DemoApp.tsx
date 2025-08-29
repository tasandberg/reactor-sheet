import { useState } from "react";
import "./DemoApp.scss";
import ReactApplication from "@src/applications/react-application";

type DemoAppProps = {
  message: string;
  appNumber?: number;
};

const DemoApp: React.FC<DemoAppProps> = ({
  message,
  appNumber = 1,
}: DemoAppProps) => {
  const [count, setCount] = useState(0);
  const heading = game.i18n?.localize("TEST.hello");
  const [appCount, setAppCount] = useState(appNumber);

  const spawnSecondApp = () => {
    const DemoApp2 = new ReactApplication({
      reactApp: DemoApp,
      rootId: "demo-application",
      initialProps: {
        message: "I'm a second app! Good night.",
        appNumber: appCount + 1,
      },
      window: {
        title: `I'm react app #${appCount + 1}`,
      },
      resizable: true,
      minimizable: true,
      classes: ["demo-application"],
      width: 500,
      height: 200,
    });
    setAppCount(appCount + 1);
    DemoApp2.render(true);
  };

  return (
    <div className="container">
      <h4>{heading}</h4>
      <div className="counter">
        <button onClick={() => setCount(count + 1)}>Click</button>
        <p>Count: {count}</p>
      </div>
      <p>
        <i>{message}</i>
      </p>
      <button onClick={spawnSecondApp}>Spawn another app</button>
    </div>
  );
};

export default DemoApp;
