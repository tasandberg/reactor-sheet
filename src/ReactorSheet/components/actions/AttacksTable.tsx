import type { AttackVM, RollSpec } from "../../viewModels/types";
import { Tag } from "../ui/Tag";
import { SectionTitle } from "../ui/SectionTitle";
import { cx } from "../ui/cx";

type Props = {
  attacks: AttackVM[];
  /** Roll a hit/damage formula (custom roll). */
  onRoll?: (spec: RollSpec) => void;
  /** Composite attack roll (OSE weapon dialog). */
  onAttack?: (itemId: string) => void;
};

/** FA dice icon for a formula's die, e.g. "1d8+2" → "fa-dice-d8". */
function dieIcon(formula: string): string {
  const n = Number(formula.match(/d(\d+)/i)?.[1] ?? 0);
  return [4, 6, 8, 10, 12, 20].includes(n) ? `fa-dice-d${n}` : "fa-dice";
}

/** Equipped-weapon attacks — one row per mode. Hit/Damage are clickable roll links;
 *  the button in the Attack! column rolls the full attack. */
export function AttacksTable({ attacks, onRoll, onAttack }: Props) {
  return (
    <section className="rs-section rs-atk">
      <SectionTitle hint="equipped weapons">Attacks</SectionTitle>
      <div className="rs-atk-table">
        <div className="rs-atk-row rs-atk-head" role="row">
          <span className="rs-atk-h">Item</span>
          <span className="rs-atk-h">Hit</span>
          <span className="rs-atk-h">Damage</span>
          <span className="rs-atk-h rs-atk-h-go">Attack!</span>
        </div>

        {attacks.map((a) => (
          <div key={a.id} className="rs-atk-row" role="row">
            <div className="rs-atk-item">
              {a.img && <img className="rs-atk-img" src={a.img} alt="" />}
              <div className="rs-atk-main">
                <div className="rs-atk-name">
                  {a.name} <span className="rs-atk-kind">({a.kind})</span>
                </div>
                <div className="rs-atk-quals">
                  <Tag intent={a.kind === "melee" ? "mustard" : "teal"}>
                    <i className={cx("fa-solid", a.kind === "melee" ? "fa-sword" : "fa-bow-arrow")} aria-hidden="true" />
                    <span className="lbl">{a.kindLabel}</span>
                  </Tag>
                  {a.qualities.map((q) => (
                    <Tag key={q.label}>
                      {q.icon && <i className={cx("fa-solid", q.icon)} aria-hidden="true" />}
                      <span className="lbl">{q.label}</span>
                    </Tag>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="rs-link rs-atk-roll"
              disabled={!onRoll}
              onClick={() => onRoll?.(a.hit)}
              title={`Roll to hit · ${a.hit.formula}`}
            >
              <i className="fa-solid fa-dice-d20" aria-hidden="true" />
              {a.hit.label}
            </button>
            <button
              type="button"
              className="rs-link rs-atk-roll"
              disabled={!onRoll}
              onClick={() => onRoll?.(a.dmg)}
              title={`Roll damage · ${a.dmg.formula}`}
            >
              <i className={cx("fa-solid", dieIcon(a.dmg.formula))} aria-hidden="true" />
              {a.dmg.label}
            </button>
            <button
              type="button"
              className="rs-atk-go"
              disabled={!onAttack}
              onClick={() => onAttack?.(a.itemId)}
              title="Attack roll (hit + damage)"
              aria-label={`Attack with ${a.name}`}
            >
              <i className="fa-solid fa-dice-d20" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
