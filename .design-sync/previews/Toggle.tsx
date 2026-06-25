import { Toggle } from "reactor-sheet";

export const States = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <Toggle defaultChecked>Inspiration</Toggle>
    <Toggle>Encumbered</Toggle>
  </div>
);
