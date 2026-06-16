import * as React from "react";
import { Segmented } from "./Segmented";

export default { title: "Controls / Segmented" };

export const Interactive = () => {
  const [value, setValue] = React.useState("combat");
  return (
    <Segmented
      options={[
        { value: "combat", label: "Combat" },
        { value: "spells", label: "Spells" },
      ]}
      value={value}
      onValueChange={setValue}
    />
  );
};
