import { cx } from "@ui/cx";
import type { TabItem } from "@layout/types";

type Props = { tabs: TabItem[]; active: string; onSelect: (id: string) => void };

/** Vertical right-edge rail (narrow layout). */
export function TabRail({ tabs, active, onSelect }: Props) {
  return (
    <nav className="rs-tabrail" aria-label="Sheet sections">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={cx("rs-tab", t.id === active && "active")}
          aria-current={t.id === active ? "page" : undefined}
          onClick={() => onSelect(t.id)}
          title={t.label}
        >
          {t.icon && <span className="rs-tab-ic">{t.icon}</span>}
          {t.label}
          {t.count != null && <span className="rs-tab-ct">{t.count}</span>}
        </button>
      ))}
    </nav>
  );
}
