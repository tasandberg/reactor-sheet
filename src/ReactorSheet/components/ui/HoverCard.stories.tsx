import { HoverCard } from "./HoverCard";

export default { title: "Overlays / HoverCard" };

/** The AC-breakdown case from the design handoff. Hover (or focus) the tile. */
export const AcBreakdown = () => (
  <div style={{ padding: 80, display: "flex", justifyContent: "center" }}>
    <HoverCard.Anchor
      focusable
      aria-describedby="hc-ac"
      style={{
        position: "relative",
        width: 96,
        padding: "6px 10px 8px",
        textAlign: "center",
        background: "var(--surface)",
        border: "1px solid color-mix(in srgb, var(--teal) 50%, transparent)",
        borderRadius: "var(--r-md)",
        cursor: "default",
      }}
    >
      <span className="stamp sm" style={{ display: "block", width: "100%" }}>AC</span>
      <div style={{ fontFamily: "var(--display)", fontSize: "var(--fs-4xl)", color: "var(--teal)" }}>12</div>
      <HoverCard id="hc-ac" placement="bottom-end">
        <HoverCard.Header title="Armor Class" badge="AAC" />
        <HoverCard.Rows
          items={[
            { label: "Base (unarmored)", value: "+10" },
            { label: "DEX modifier", value: "+1" },
            { label: "Ring of protection +1", value: "+1" },
          ]}
        />
        <HoverCard.Total label="Total" value="12" unit="AAC" />
      </HoverCard>
    </HoverCard.Anchor>
  </div>
);

/** Placement variants — each reveals on hover. */
export const Placements = () => {
  const placements = ["bottom-end", "bottom-start", "top-end", "top-start"] as const;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 100, padding: 100 }}>
      {placements.map((p) => (
        <HoverCard.Anchor
          key={p}
          focusable
          style={{
            position: "relative",
            justifySelf: "center",
            padding: "8px 12px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            cursor: "default",
          }}
        >
          <span style={{ fontFamily: "var(--mono)", fontSize: "var(--fs-xs)", color: "var(--text-dim)" }}>{p}</span>
          <HoverCard placement={p}>
            <HoverCard.Header title="Breakdown" badge="DEMO" />
            <HoverCard.Rows items={[{ label: "Base", value: "+10" }, { label: "Bonus", value: "+2" }]} />
            <HoverCard.Total label="Total" value="12" />
          </HoverCard>
        </HoverCard.Anchor>
      ))}
    </div>
  );
};
