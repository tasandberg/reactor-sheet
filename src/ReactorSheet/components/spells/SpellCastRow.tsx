import type { ReactNode } from "react";
import type { OseSpell } from "../../types/types";
import { cx } from "../ui/cx";

type Props = {
  spell: OseSpell;
  /** Meta line content, e.g. "Lvl 1 · 150'" (the views build this differently). */
  meta: ReactNode;
  onCast: () => void;
  /** When provided, renders a "−" unprepare button (Spells tab only). */
  onUnprepare?: () => void;
  /** When provided, the name is a link that opens the item sheet (Spells tab). */
  onOpenName?: () => void;
  /** Row wrapper class: "fvtt-spell" (Actions quick-cast) or "rs-spell" (Spells tab). */
  rowClass: string;
};

/**
 * One spell row, shared by the Actions quick-cast list and the Spells-tab prepared
 * rows. Shows the name (+ ×N when selected into >1 slot), the cast dots to the
 * right (gold = a cast remaining, light = a used/spent cast — used dots stay), the
 * meta line, a cast/"spent" button, and (optionally) a "−" to free a slot.
 *
 * `total` slots = max(memorized, cast); `cast` of them are still ready.
 */
export function SpellCastRow({ spell, meta, onCast, onUnprepare, onOpenName, rowClass }: Props) {
  const left = spell.system.cast ?? 0;
  const total = Math.max(spell.system.memorized ?? 0, left);
  const spent = left <= 0;
  const nameLabel = (
    <>
      {spell.name}
      {spell.system.memorized > 1 ? ` ×${spell.system.memorized}` : ""}
    </>
  );
  return (
    <div className={cx(rowClass, spent && "spent")}>
      <div className="spinfo">
        <span className="spn-row">
          {onOpenName ? (
            <a className="spn" onClick={onOpenName}>{nameLabel}</a>
          ) : (
            <span className="spn">{nameLabel}</span>
          )}
          <span className="sp-dots" role="img" aria-label={`${left} of ${total} casts remaining`}>
            {Array.from({ length: total }).map((_, i) => (
              <span key={i} className={cx("sp-dot", i < left && "filled")} aria-hidden="true" />
            ))}
          </span>
          {onUnprepare && (
            <button
              type="button"
              className="sp-trash"
              onClick={onUnprepare}
              title={`Remove ${spell.name}`}
              aria-label={`Remove ${spell.name}`}
            >
              <i className="fa-solid fa-trash-can" aria-hidden="true" />
            </button>
          )}
        </span>
        <span className="spm">{meta}</span>
      </div>
      <span className="sp-actions">
        <button
          type="button"
          className="sp-cast"
          disabled={spent}
          onClick={onCast}
          title={spent ? `${spell.name} — spent (Rest to recover)` : `Cast ${spell.name}`}
        >
          {spent ? "spent" : "cast"}
        </button>
      </span>
    </div>
  );
}
