import ActorImage from "../ActorImage";
import HitPoints from "./HitPoints";
import Properties from "../PropertiesGrid";
import SavingThrows from "../SheetPages/SavingThrows";

export default function Info() {
  return (
    <div
      style={{
        gridArea: "info",
        width: 228,
        padding: "1rem",
        overflow: "hidden auto",
      }}
    >
      <div className="flex-col">
        <ActorImage />
        <HitPoints />
        <Properties />
        <SavingThrows />
      </div>
    </div>
  );
}
