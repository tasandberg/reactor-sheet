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
  const { level, slots, occupied, prepared, spellbook } = vm;
  const [bookOpen, setBookOpen] = useState(false);

  // Capacity is measured in OCCUPIED slots (sum of memorized), which persists across
  // casts — so you can't over-memorise even after spells are spent.
  const atCapacity = occupied >= slots.max;

  // Memorise into a slot: bump both memorized (the selection) and cast (a ready cast).
  const prepare = (spell: OseSpell) => {
    if (atCapacity) return;
    void spell.update({
      "system.memorized": spell.system.memorized + 1,
      "system.cast": spell.system.cast + 1,
    });
  };
  // Free a slot — works even when spent (cast 0): drop one memorized + one cast.
  const unprepare = (spell: OseSpell) => {
    if (spell.system.memorized <= 0) return;
    void spell.update({
      "system.memorized": spell.system.memorized - 1,
      "system.cast": Math.max(0, spell.system.cast - 1),
    });
  };
  const cast = (spell: OseSpell) => void spell.spendSpell({ skipDialog: false });

  // One pip per slot: the first `used` (= casts ready) are filled, the rest spent.
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
          <div className={cx("rs-spell", spell.system.cast <= 0 && "spent")} key={spell._id as string}>
            <div className="spinfo">
              <span className="spn-row">
                <a className="spn" onClick={() => spell.sheet.render(true)}>
                  {spell.name}
                  {spell.system.memorized > 1 ? ` ×${spell.system.memorized}` : ""}
                </a>
                {/* one dot per slot; gold = cast remaining, light = used (kept) */}
                <span className="sp-dots" role="img" aria-label={`${spell.system.cast} casts remaining`}>
                  {Array.from({ length: Math.max(spell.system.memorized ?? 0, spell.system.cast ?? 0) }).map((_, i) => (
                    <span key={i} className={cx("sp-dot", i < spell.system.cast && "filled")} aria-hidden="true" />
                  ))}
                </span>
              </span>
              <span className="spm">
                {spellMeta(spell).map((p) => (
                  <span key={p.kind} className={cx(p.kind === "damage" && "dmg")}>
                    {p.text}
                  </span>
                ))}
              </span>
            </div>
            <span className="sp-actions">
              <button
                type="button"
                className="sp-unprep"
                onClick={() => unprepare(spell)}
                title={`Unprepare ${spell.name}`}
                aria-label={`Unprepare ${spell.name}`}
              >
                <i className="fa-solid fa-minus" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="rs-link sp-cast"
                disabled={spell.system.cast <= 0}
                onClick={() => cast(spell)}
                title={spell.system.cast <= 0 ? `${spell.name} — spent (Rest to recover)` : `Cast ${spell.name}`}
              >
                {spell.system.cast <= 0 ? "spent" : "cast"}
              </button>
            </span>
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
              // slots — always a "+", never a checkmark. Removing a copy is the
              // "−" on the prepared rows above.
              const prepCount = spell.system.memorized ?? 0;
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
                  <span className="bn">{spell.name}</span>
                  <span className="pa" aria-hidden="true">
                    <i className="fa-solid fa-plus" />
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
