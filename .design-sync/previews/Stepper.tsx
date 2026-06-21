import * as React from "react";
import { Stepper } from "reactor-sheet";

export const Interactive = () => {
  const [hp, setHp] = React.useState(8);
  return <Stepper value={hp} onValueChange={setHp} min={0} max={9} />;
};
