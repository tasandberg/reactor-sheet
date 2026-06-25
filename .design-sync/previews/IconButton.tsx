import { IconButton } from "reactor-sheet";

export const Variants = () => (
  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
    <IconButton>✎</IconButton>
    <IconButton variant="accent">⌄</IconButton>
    <IconButton variant="danger">×</IconButton>
    <IconButton variant="round">+</IconButton>
    <IconButton on>✎</IconButton>
    <IconButton size="sm">×</IconButton>
  </div>
);
