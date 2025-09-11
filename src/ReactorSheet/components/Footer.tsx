import { useReactorSheetContext } from "./context";
import Encumbrance from "./Encumbrance";

export default function Footer() {
  const { actor } = useReactorSheetContext();
  const treasures = Object.values(actor.system.treasures);
  console.log(actor);
  console.log({ treasures });
  const currencies = ["GP", "SP", "CP", "PP", "EP"].map((cur) =>
    treasures.find((t) => t.name === cur)
  );
  return (
    <div
      style={{
        gridArea: "footer",
        padding: "0.5rem",
        alignSelf: "end",
        height: "250px",
      }}
    >
      <div className="flex-col justyfy-center align-center">
        <Encumbrance />
        <div className="flex-row">
          {currencies.map((cur) => (
            <span key={`currency-${cur.name}`}>
              {cur.name} {cur.system.quantity.value}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
