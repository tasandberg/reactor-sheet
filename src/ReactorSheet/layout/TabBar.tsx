import { cx } from "@ui/cx";
import type { TabItem } from "@layout/types";

type Props = { tabs: TabItem[]; active: string; onSelect: (id: string) => void };

/** Horizontal tab bar (wide layout; shown ≥800c via .rs-htabs). */
export function TabBar({ tabs, active, onSelect }: Props) {
  return (
    <div className="rs-htabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === active}
          aria-controls="rs-tabpanel"
          className={cx("rs-htab", t.id === active && "active")}
          onClick={() => onSelect(t.id)}
        >
          {t.icon && <span className="rs-htab-ic">{t.icon}</span>}
          {t.label}
          {t.count != null && <span className="rs-htab-ct">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
