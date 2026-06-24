import { cx } from "./cx";
import type { HTMLAttributes, ReactNode } from "react";

/** Placement of the card relative to its anchor. `bottom-end` (under the anchor,
 *  right-aligned) is the AC-breakdown default; the arrow repositions to match. */
export type HoverCardPlacement = "bottom-end" | "bottom-start" | "top-end" | "top-start";

type AnchorProps = HTMLAttributes<HTMLDivElement> & {
  /** When set, the anchor becomes keyboard-focusable so the card reveals on focus too. */
  focusable?: boolean;
};

/** Relative wrapper that drives the reveal on `:hover` / `:focus-within`.
 *  Wrap the visible trigger and a <HoverCard> together inside this. */
function Anchor({ focusable, className, tabIndex, ...rest }: AnchorProps) {
  return (
    <div
      className={cx("hovercard-anchor", className)}
      tabIndex={focusable ? (tabIndex ?? 0) : tabIndex}
      {...rest}
    />
  );
}

type Props = Omit<HTMLAttributes<HTMLDivElement>, "role"> & {
  placement?: HoverCardPlacement;
  /** Read-only by default → `tooltip`. Use `dialog` only if it becomes interactive. */
  role?: "tooltip" | "dialog";
};

/**
 * Anchored hover-popover for showing a small stat breakdown next to the value it
 * explains (e.g. the AC breakdown). Read-only: default `role="tooltip"`, revealed
 * by the parent `.hovercard-anchor` on hover/focus-within. Token-only; themes via
 * `--surface-2` / `--teal` / `--border` / `--text*`.
 *
 * @category Overlays
 */
export function HoverCard({ placement = "bottom-end", role = "tooltip", className, ...rest }: Props) {
  return <div className={cx("hovercard", `po-${placement}`, className)} role={role} {...rest} />;
}

/** Title row + optional system badge (e.g. "Armor Class" · AAC). */
function Header({ title, badge }: { title: ReactNode; badge?: ReactNode }) {
  return (
    <div className="hc-h">
      <span>{title}</span>
      {badge != null && <span className="hc-sys">{badge}</span>}
    </div>
  );
}

/** Key/value breakdown list — the common case (Base / DEX modifier / …). */
function Rows({ items }: { items: { label: ReactNode; value: ReactNode }[] }) {
  return (
    <ul className="hc-rows">
      {items.map((it, i) => (
        <li key={i}>
          <span className="hc-k">{it.label}</span>
          <span className="hc-v">{it.value}</span>
        </li>
      ))}
    </ul>
  );
}

/** Footer total row, with an optional trailing unit (e.g. 12 AAC). */
function Total({ label, value, unit }: { label: ReactNode; value: ReactNode; unit?: ReactNode }) {
  return (
    <div className="hc-total">
      <span>{label}</span>
      <span className="hc-tv">
        {value}
        {unit != null && <small> {unit}</small>}
      </span>
    </div>
  );
}

HoverCard.Anchor = Anchor;
HoverCard.Header = Header;
HoverCard.Rows = Rows;
HoverCard.Total = Total;
