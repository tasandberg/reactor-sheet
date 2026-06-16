import { Stamp } from "./Stamp";

export default { title: "Display / Stamp" };

export const Sizes = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
    <Stamp size="sm">STR</Stamp>
    <Stamp size="md">HP</Stamp>
    <Stamp size="lg">AC</Stamp>
  </div>
);
