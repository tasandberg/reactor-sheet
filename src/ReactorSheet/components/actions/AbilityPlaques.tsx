import type { AbilityVM } from "../../viewModels/types";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { abilities: AbilityVM[] };

/** Six ability plaques (label · value · mod). Read-only (rollCheck is later). */
export function AbilityPlaques({ abilities }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle hint="roll-under d20">Abilities</SectionTitle>
      <div className="rs-abilities">
        {abilities.map((a) => (
          <div className="rs-abil" key={a.key}>
            <div className="ak">{a.label}</div>
            <div className="av">{a.value}</div>
            <div className="am">{a.modLabel}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
