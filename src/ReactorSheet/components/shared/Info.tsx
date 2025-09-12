import ActorImage from "../ActorImage";
import ArmorClass from "../ArmorClass";
import HitPoints from "../HitPoints";
import Properties from "../PropertiesGrid";
import SavingThrows from "../SheetPages/SavingThrows";

export default function Info() {
  return (
    <div
      style={{
        gridArea: "info",
        width: 200,
        padding: "1rem",
        overflow: "hidden auto",
      }}
    >
      <div className="flex-col">
        <ActorImage />
        <div className="flex-row justify-around gap-0">
          <HitPoints />
        </div>
        <Properties />
        <SavingThrows />
      </div>
    </div>
  );
}
