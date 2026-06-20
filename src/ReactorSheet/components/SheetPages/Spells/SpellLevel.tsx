import { useState } from "react";
import type { OseSpell } from "../../../types/types";
import type { SpellLevelVM } from "../../../viewModels/types";
import { spellMeta } from "../../../viewModels/spells";
import { cx } from "../../ui/cx";

/**
 * One spell level: ink-stamp "Level N" badge + "used / max ready" + slot pips,
 * the prepared-spell cast rows, and an expandable spellbook of all known spells.
 */
export default function SpellLevel({ vm }: { vm: SpellLevelVM }) {
  const { level, slots, prepared, spellbook } = vm;
  const [bookOpen, setBookOpen] = useState(false);

  const atCapacity = slots.used >= slots.max;

  // Prepare = bump `cast`; OSE keeps memorized count in `cast` (decremented on cast).
  const prepare = (spell: OseSpell) => {
    if (atCapacity) return;
    void spell.update({
      "system.cast": spell.system.cast + 1,
      "system.memorized": spell.system.memorized + 1,
    });
  };
  const unprepare = (spell: OseSpell) => {
    if (spell.system.cast <= 0) return;
    void spell.update({
      "system.cast": spell.system.cast - 1,
      "system.memorized": Math.max(0, spell.system.memorized - 1),
    });
  };
  const cast = (spell: OseSpell) => void spell.spendSpell({ skipDialog: false });

  // One pip per slot: the first `used` are available (filled), the rest spent (empty).
  const pips = Array.from({ length: slots.max }, (_, i) => i < slots.used);

  return (
    <div className="rs-spelllevel">
      <div className="rs-spellhead">
        <span className="lv">Level {level}</span>
        <span className="sc">
          {slots.used} / {slots.max} ready
        </span>
        <span className="slots">
          {pips.map((filled, i) => (
            <span key={i} className={cx("rs-pip", filled && "filled")} aria-hidden="true">
              {filled ? <i className="fa-solid fa-diamond" /> : null}
            </span>
          ))}
        </span>
      </div>

      {prepared.length === 0 ? (
        <div className="rs-spell empty">
          <span aria-hidden="true" />
          <div className="none">None memorised — open the spellbook.</div>
          <span aria-hidden="true" />
        </div>
      ) : (
        prepared.map((spell) => (
          <div className="rs-spell" key={spell._id as string}>
            <button
              type="button"
              className="chk"
              onClick={() => unprepare(spell)}
              title={`Unprepare ${spell.name}`}
              aria-label={`Unprepare ${spell.name}`}
            >
              <i className="fa-solid fa-check" aria-hidden="true" />
            </button>
            <div className="spinfo">
              <a className="spn" onClick={() => spell.sheet.render(true)}>
                {spell.name}
                {spell.system.cast > 1 ? ` ×${spell.system.cast}` : ""}
              </a>
              <span className="spm">
                {spellMeta(spell).map((p) => (
                  <span key={p.kind} className={cx(p.kind === "damage" && "dmg")}>
                    {p.text}
                  </span>
                ))}
              </span>
            </div>
            <button
              type="button"
              className="rs-link sp-cast"
              onClick={() => cast(spell)}
              title={`Cast ${spell.name}`}
            >
              cast
            </button>
          </div>
        ))
      )}

      <button
        type="button"
        className={cx("rs-bookbtn", bookOpen && "open")}
        onClick={() => setBookOpen((o) => !o)}
        aria-expanded={bookOpen}
      >
        <i className={cx("fa-solid", bookOpen ? "fa-caret-down" : "fa-caret-right")} aria-hidden="true" />
        Spellbook ({spellbook.length})
      </button>
      {bookOpen && (
        <div className="rs-book">
          {spellbook.length === 0 ? (
            <div className="rs-book-empty">No spells known at this level.</div>
          ) : (
            spellbook.map((spell) => {
              // Spellbook always MEMORISES (adds a copy) up to the level's free
              // slots — so a spell can be memorised more than once. Removing a
              // copy is done from the prepared rows above (their ✓ unprepares).
              const prepCount = spell.system.memorized || spell.system.cast || 0;
              const isPrep = prepCount > 0;
              return (
                <button
                  type="button"
                  key={spell._id as string}
                  className={cx("rs-bookspell", isPrep && "prep")}
                  disabled={atCapacity}
                  onClick={() => prepare(spell)}
                  title={atCapacity ? "No slots left at this level" : `Memorise ${spell.name}`}
                >
                  <span className="bn">
                    {spell.name}
                    {prepCount > 1 ? ` ×${prepCount}` : ""}
                  </span>
                  <span className="pa" aria-hidden="true">
                    <i className={cx("fa-solid", isPrep ? "fa-check" : "fa-plus")} />
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
