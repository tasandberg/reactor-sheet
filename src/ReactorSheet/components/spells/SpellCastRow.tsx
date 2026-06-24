import { useState, type ReactNode } from "react";
import type { OseSpell } from "../../types/types";
import { cx } from "../ui/cx";
import { IconButton } from "../ui/IconButton";

type Props = {
  spell: OseSpell;
  /** Meta line content, e.g. "Lvl 1 · 150'" (the views build this differently). */
  meta: ReactNode;
  /** Fires the cast. Return the mutation promise so the button can show a spinner. */
  onCast: () => void | Promise<unknown>;
  /** When provided, renders a "−" unprepare button (Spells tab only). */
  onUnprepare?: () => void;
  /** When provided, the name is a link that opens the item sheet (Spells tab). */
  onOpenName?: () => void;
  /** Row wrapper class — "rs-spell" (Spells tab + Actions quick-cast). */
  rowClass: string;
};

/**
 * One spell row, shared by the Actions quick-cast list and the Spells-tab prepared
 * rows. Shows the name, the cast dots to the right (one per slot; gold = a cast
 * remaining, light = a used/spent cast — used dots stay), the meta line, a
 * cast/"spent" button, and (optionally, Spells tab) a trashcan to free a slot.
 *
 * `total` slots = max(memorized, cast); `cast` of them are still ready.
 */
export function SpellCastRow({ spell, meta, onCast, onUnprepare, onOpenName, rowClass }: Props) {
  const left = spell.system.cast ?? 0;
  const total = Math.max(spell.system.memorized ?? 0, left);
  const spent = left <= 0;
  const nameLabel = spell.name;
  const [casting, setCasting] = useState(false);

  const handleCast = async () => {
    if (casting) return;
    setCasting(true);
    try {
      await onCast();
    } finally {
      setCasting(false);
    }
  };
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
            <IconButton
              variant="danger"
              size="sm"
              onClick={onUnprepare}
              title={`Remove ${spell.name}`}
              aria-label={`Remove ${spell.name}`}
            >
              <i className="fa-solid fa-trash-can" aria-hidden="true" />
            </IconButton>
          )}
        </span>
        <span className="spm">{meta}</span>
      </div>
      <span className="sp-actions">
        <button
          type="button"
          className="sp-cast"
          disabled={spent || casting}
          aria-busy={casting}
          onClick={handleCast}
          title={spent ? `${spell.name} — spent (Rest to recover)` : `Cast ${spell.name}`}
        >
          {casting ? <i className="fa-solid fa-spinner fa-spin" aria-hidden="true" /> : spent ? "spent" : "cast"}
        </button>
      </span>
    </div>
  );
}
