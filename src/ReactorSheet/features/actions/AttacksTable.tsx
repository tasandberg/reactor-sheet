import { useState } from "react";
import type { AttackVM, RollSpec } from "@domain/vm-types";
import { SectionTitle } from "@ui/SectionTitle";
import { cx } from "@ui/cx";

type Props = {
  attacks: AttackVM[];
  /** Roll a hit/damage formula (custom roll). */
  onRoll?: (spec: RollSpec) => void;
  /** Composite attack roll (OSE weapon dialog). */
  onAttack?: (itemId: string) => void;
};

/** Monogram glyph for the ink-stamp weapon icon (first letter, Title-case). */
function monogram(name: string): string {
  return (name.trim().charAt(0) || "?").toUpperCase();
}

const kindIcon = (kind: "melee" | "missile") => (kind === "melee" ? "fa-sword" : "fa-bow-arrow");

/** One weapon card. A melee+missile weapon shows both kind tags as a toggle
 *  (melee active by default); the active mode drives Hit/Dmg. */
function WeaponRow({ a, onRoll, onAttack }: { a: AttackVM; onRoll?: Props["onRoll"]; onAttack?: Props["onAttack"] }) {
  const [active, setActive] = useState(0); // index into a.modes (melee = 0)
  const mode = a.modes[active] ?? a.modes[0];
  const dual = a.modes.length > 1;

  return (
    <div className="rs-weapon" role="row">
      <div className="winfo">
        {a.img ? (
          <img className="wic wic-img" src={a.img} alt="" />
        ) : (
          <span className="wic" aria-hidden="true">{monogram(a.name)}</span>
        )}
        <div className="wmain">
          <div className="wname">
            {a.name} <span className="wkind">({mode.kindLabel.toLowerCase()})</span>
          </div>
          <div className="wtags">
            {/* dual melee+missile → a segmented switch; single mode → a static tag */}
            {dual ? (
              <div className="kind-switch" role="group" aria-label="Attack mode">
                {a.modes.map((m, i) => (
                  <button
                    type="button"
                    key={m.kind}
                    className={cx("kind-seg", m.kind, i === active && "selected")}
                    aria-pressed={i === active}
                    onClick={() => setActive(i)}
                    title={`${m.kindLabel} attack`}
                  >
                    <i className={cx("fa-solid", kindIcon(m.kind))} aria-hidden="true" />
                    <span className="tag-pop" role="tooltip">{m.kindLabel}</span>
                  </button>
                ))}
              </div>
            ) : (
              <span className={cx("fvtt-tag", a.modes[0].kind)} title={a.modes[0].kindLabel}>
                <i className={cx("fa-solid", kindIcon(a.modes[0].kind))} aria-hidden="true" />
                <span className="tag-pop" role="tooltip">{a.modes[0].kindLabel}</span>
              </span>
            )}
            {a.qualities.map((q) => (
              <span className="fvtt-tag" key={q.label} title={q.label}>
                {q.icon ? (
                  <i className={cx("fa-solid", q.icon)} aria-hidden="true" />
                ) : (
                  <span className="tag-txt">{q.label}</span>
                )}
                {q.icon && <span className="tag-pop" role="tooltip">{q.label}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="wstat hit"
        disabled={!onRoll}
        onClick={() => onRoll?.(mode.hit)}
        title={`Roll to hit · ${mode.hitTip}`}
      >
        <span className="sl">Hit</span>
        <span className="wv">
          <i className={cx("fa-solid", kindIcon(mode.kind))} aria-hidden="true" />
          {mode.hitDisplay}
        </span>
        <span className="tag-pop" role="tooltip">{mode.hitTip}</span>
      </button>
      <button
        type="button"
        className="wstat dmg"
        disabled={!onRoll}
        onClick={() => onRoll?.(mode.dmg)}
        title={`Roll damage · ${mode.dmgTip}`}
      >
        <span className="sl">Dmg</span>
        <span className="wv">{mode.dmgDisplay}</span>
        <span className="tag-pop" role="tooltip">{mode.dmgTip}</span>
      </button>

      <button
        type="button"
        className="fvtt-atk"
        disabled={!onAttack}
        onClick={() => onAttack?.(a.itemId)}
        title="Attack roll (hit + damage)"
        aria-label={`Attack with ${a.name}`}
      >
        <i className="fa-solid fa-dice-d20" aria-hidden="true" />
        <span>Attack</span>
      </button>
    </div>
  );
}

/** Equipped-weapon attacks as woodcut weapon cards: ink-stamp monogram, name +
 *  melee/missile + quality tags, clickable HIT/DMG stat cells (FA dice), and a
 *  tall brass Attack button (full hit + damage via the OSE weapon dialog). */
export function AttacksTable({ attacks, onRoll, onAttack }: Props) {
  return (
    <section className="rs-section rs-atk">
      <SectionTitle hint="click to roll">Attacks</SectionTitle>
      <div className="rs-wtable">
        {attacks.map((a) => (
          <WeaponRow key={a.id} a={a} onRoll={onRoll} onAttack={onAttack} />
        ))}
      </div>
    </section>
  );
}
