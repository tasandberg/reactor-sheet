import type { VitalsVM } from "../../viewModels/types";
import { KvCard } from "../ui/Card";
import { Stamp } from "../ui/Stamp";

type Props = { vm: VitalsVM };

/** HP (crimson) + AC (teal) boxes. Read-only (steppers/AC-toggle are later). */
export function Vitals({ vm }: Props) {
  return (
    <div className="rs-vitals">
      <KvCard className="hp">
        <div className="head"><Stamp>Hit Points</Stamp></div>
        <div className="val">
          {vm.hp.value}
          <span className="unit">/ {vm.hp.max}</span>
        </div>
      </KvCard>
      <KvCard className="ac">
        <div className="head"><Stamp>Armor Class</Stamp></div>
        <div className="val">{vm.ac.ascending}</div>
        <div className="breakdown">AAC · DAC {vm.ac.descending}</div>
      </KvCard>
    </div>
  );
}
