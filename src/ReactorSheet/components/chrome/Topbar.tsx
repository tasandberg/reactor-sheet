import type { TopbarVM } from "../../viewModels/types";
import { toggleTheme } from "../../theme";

type Props = { vm: TopbarVM };

/** Persistent topbar: level, XP, and chrome actions. The bar stays dark in both
 *  themes (--ink). Rest/Level Up/Edit are inert in the display pass; the theme
 *  toggle is live. */
export function Topbar({ vm }: Props) {
  const pct = vm.xp.next > 0 ? Math.min(100, (vm.xp.value / vm.xp.next) * 100) : 0;

  return (
    <div className="rs-topbar-inner">
      <div className="rs-tb-lv">
        <b>Lv {vm.level}</b>
        <span className="cur">{vm.xp.value.toLocaleString()}</span>
      </div>
      <div className="rs-tb-xp" title={`${vm.xp.value.toLocaleString()} XP`}>
        <div className="rs-tb-bar">
          <i style={{ width: `${pct}%` }} />
          <span className="v">{vm.xp.value.toLocaleString()} XP</span>
        </div>
      </div>
      <div className="rs-tb-lv next">
        <b>Lv {vm.nextLevel}</b>
        <span className="cur">{vm.xp.next.toLocaleString()}</span>
      </div>
      <button type="button" className="rs-tb-btn" disabled>
        <span className="i" aria-hidden="true">☾</span>
        <span className="lbl">Rest</span>
      </button>
      <button type="button" className="rs-tb-btn up" disabled>
        <span className="i" aria-hidden="true">▲</span>
        <span className="lbl">Level Up</span>
      </button>
      <button type="button" className="rs-tb-btn" disabled>
        <span className="i" aria-hidden="true">✎</span>
        <span className="lbl">Edit</span>
      </button>
      <button
        type="button"
        className="rs-tb-btn icon"
        onClick={toggleTheme}
        title="Toggle colour scheme"
        aria-label="Toggle colour scheme"
      >
        <span className="i" aria-hidden="true">◐</span>
      </button>
    </div>
  );
}
