import { Check } from "reactor-sheet";

export const States = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <Check defaultChecked>Proficient</Check>
    <Check>Has Shield</Check>
  </div>
);
