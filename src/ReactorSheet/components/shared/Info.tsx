import ActorImage from "../ActorImage";
import ArmorClass from "../ArmorClass";
import HitPoints from "../HitPoints";
import Properties from "../PropertiesGrid";
import SavingThrows from "../SheetPages/SavingThrows";

export default function Info() {
  return (
    <div style={{ gridArea: "info", justifySelf: "stretch", height: "100%" }}>
      <div className="flex-col">
        <ActorImage />
        <div className="flex-row justify-around gap-0">
          <HitPoints />
          <ArmorClass />
        </div>
        <Properties />
        <SavingThrows />
      </div>
    </div>
  );
}
