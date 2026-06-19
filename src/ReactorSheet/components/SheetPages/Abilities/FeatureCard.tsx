import { useEffect, useState } from "react";
import type { FeatureVM } from "../../../viewModels/features";
import { useReactorSheetContext } from "../../context";
import { cx } from "../../ui/cx";

/** Enrich raw HTML once via Foundry's TextEditor (links, inline rolls, embeds). */
function useEnriched(html: string): string {
  const { actor } = useReactorSheetContext();
  const [enriched, setEnriched] = useState(html);
  useEffect(() => {
    let live = true;
    foundry.applications.ux.TextEditor.enrichHTML(html, {
      secrets: false,
      documents: true,
      links: true,
      rolls: true,
      embeds: true,
      relativeTo: actor,
    }).then((out) => {
      if (live) setEnriched(out);
    });
    return () => {
      live = false;
    };
  }, [html, actor]);
  return enriched;
}

/** Collapsible class/race feature: ink-stamp · title · roll-tag pill · chevron. */
export function FeatureCard({ feature }: { feature: FeatureVM }) {
  const [open, setOpen] = useState(false);
  const desc = useEnriched(feature.description);
  const monogram = feature.name.charAt(0).toUpperCase();

  return (
    <div className={cx("fvtt-feat", open && "open")}>
      <button
        type="button"
        className="ft-head"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {feature.img ? (
          <img className="ft-ic" src={feature.img} alt="" aria-hidden="true" />
        ) : (
          <span className="ft-ic" aria-hidden="true">
            {monogram}
          </span>
        )}
        <span className="ft-title">{feature.name}</span>
        {feature.rollTag && <span className="ft-roll-tag">{feature.rollTag}</span>}
        <span className="ft-chev" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <div className="ft-body">
          {feature.requirements && (
            <div className="ft-req">{feature.requirements}</div>
          )}
          <div
            className="ft-desc"
            dangerouslySetInnerHTML={{ __html: desc }}
          />
          <div className="ft-actions">
            {feature.rollable && (
              <button type="button" className="rs-link" onClick={feature.onRoll}>
                <i className="fas fa-dice-d20" aria-hidden="true" /> Roll {feature.rollTag}
              </button>
            )}
            <button
              type="button"
              className="ft-del"
              title="Delete feature"
              onClick={feature.onDelete}
            >
              <i className="fas fa-trash" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
