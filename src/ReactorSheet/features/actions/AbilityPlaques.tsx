import type { AbilityVM } from "@domain/vm-types";
import { Stamp } from "@ui/Stamp";
import { cx } from "@ui/cx";
import { rollable } from "@features/actions/rollable";

type Props = { abilities: AbilityVM[]; onRoll?: (key: string) => void };

/** Six ability plaques (label · value · mod). Click rolls a roll-under check. */
export function AbilityPlaques({ abilities, onRoll }: Props) {
  return (
    <section className="rs-section">
      <div className="rs-abilities">
        {abilities.map((a) => (
          <div
            className={cx("rs-abil", onRoll && "rollable")}
            key={a.key}
            data-testid={`ability-${a.key}`}
            title={onRoll ? `Roll ${a.label} check` : undefined}
            {...rollable(onRoll && (() => onRoll(a.key)))}
          >
            <Stamp className="rs-abil-k">{a.label}</Stamp>
            <div className="av">{a.value}</div>
            <div className="am">{a.modLabel}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
