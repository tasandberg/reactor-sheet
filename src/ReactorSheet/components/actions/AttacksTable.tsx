import type { AttackVM, RollSpec } from "../../viewModels/types";
import { SectionTitle } from "../ui/SectionTitle";
import { cx } from "../ui/cx";

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

/** Equipped-weapon attacks as woodcut weapon cards: ink-stamp monogram, name +
 *  melee/missile + quality tags, clickable HIT/DMG stat cells (FA dice), and a
 *  tall brass Attack button (full hit + damage via the OSE weapon dialog). */
export function AttacksTable({ attacks, onRoll, onAttack }: Props) {
  return (
    <section className="rs-section rs-atk">
      <SectionTitle hint="click to roll">Attacks</SectionTitle>
      <div className="rs-wtable">
        {attacks.map((a) => (
          <div key={a.id} className="rs-weapon" role="row">
            <div className="winfo">
              {a.img ? (
                <img className="wic wic-img" src={a.img} alt="" />
              ) : (
                <span className="wic" aria-hidden="true">{monogram(a.name)}</span>
              )}
              <div className="wmain">
                <div className="wname">
                  {a.name} <span className="wkind">({a.kindLabel.toLowerCase()})</span>
                </div>
                <div className="wtags">
                  <span className={cx("fvtt-tag", a.kind === "missile" ? "missile" : "melee")} title={a.kindLabel}>
                    <i
                      className={cx("fa-solid", a.kind === "melee" ? "fa-sword" : "fa-bow-arrow")}
                      aria-hidden="true"
                    />
                    <span className="tag-pop" role="tooltip">{a.kindLabel}</span>
                  </span>
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
              onClick={() => onRoll?.(a.hit)}
              title={`Roll to hit · ${a.hitTip}`}
            >
              <span className="sl">Hit</span>
              <span className="wv">
                <i className={cx("fa-solid", a.kind === "melee" ? "fa-sword" : "fa-bow-arrow")} aria-hidden="true" />
                {a.hitDisplay}
              </span>
              <span className="tag-pop" role="tooltip">{a.hitTip}</span>
            </button>
            <button
              type="button"
              className="wstat dmg"
              disabled={!onRoll}
              onClick={() => onRoll?.(a.dmg)}
              title={`Roll damage · ${a.dmgTip}`}
            >
              <span className="sl">Dmg</span>
              <span className="wv">{a.dmgDisplay}</span>
              <span className="tag-pop" role="tooltip">{a.dmgTip}</span>
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
        ))}
      </div>
    </section>
  );
}
