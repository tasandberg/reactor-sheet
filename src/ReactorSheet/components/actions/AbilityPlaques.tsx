import type { AbilityVM } from "../../viewModels/types";
import { KvCard } from "../ui/Card";
import { Stamp } from "../ui/Stamp";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { abilities: AbilityVM[] };

/** Six ability plaques (label · value · mod). Read-only (rollCheck is later). */
export function AbilityPlaques({ abilities }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle hint="roll-under d20">Abilities</SectionTitle>
      <div className="rs-abilities">
        {abilities.map((a) => (
          <KvCard key={a.key}>
            <div className="head"><Stamp>{a.label}</Stamp></div>
            <div className="val">{a.value}</div>
            <Stamp className="rs-mod">{a.modLabel}</Stamp>
          </KvCard>
        ))}
      </div>
    </section>
  );
}
