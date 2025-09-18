import { useReactorSheetContext } from "../context";
import { Row } from "../shared/elements";
import { colors } from "../shared/elements-vars";

export default function Footer() {
  const { actor } = useReactorSheetContext();
  const treasures = Object.values(actor.system.treasures);

  const currencies = ["GP", "SP", "CP", "PP", "EP"]
    .map((cur) => treasures.find((t) => t.name === cur))
    .filter((t) => !!t);

  return (
    <div
      style={{
        gridArea: "footer",
        padding: "0.5rem",
        background: "#222",
        height: "80px",
        width: "100%",
        borderTop: "1px solid #444",
        boxShadow: "0 -2px 4px rgba(0,0,0,0.5)",
        backgroundColor: colors.bgDark,
        zIndex: 2,
      }}
      className="flex-col justify-center align-center gap-0"
    >
      <Row>
        <div className="w-100">
          {/* <InfoGridItem
            label="Encounter:"
            valueWidth={2}
            value={actor.system.movement.encounter + " ft."}
          />
          <InfoGridItem
            label="Overland:"
            valueWidth={2}
            value={actor.system.movement.overland + " miles"}
          />
          <InfoGridItem
            label="Exploration:"
            valueWidth={2}
            value={actor.system.movement.base + " ft."}
          /> */}
          Movement
        </div>
        <div className="w-100">
          {currencies.map((cur) => (
            <span key={`currency-${cur?.name}`}>
              {cur?.name} {cur.system.quantity.value}
            </span>
          ))}
        </div>
      </Row>
    </div>
  );
}
