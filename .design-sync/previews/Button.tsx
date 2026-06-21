import { Button } from "reactor-sheet";

export const Variants = () => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
    <Button>Default</Button>
    <Button variant="primary">Primary</Button>
    <Button variant="danger">Danger</Button>
    <Button variant="ghost">Ghost</Button>
    <Button size="sm" variant="primary">Small</Button>
    <Button disabled>Disabled</Button>
  </div>
);
