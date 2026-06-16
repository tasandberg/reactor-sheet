import type { ReactNode } from "react";
import { TabRail } from "./TabRail";
import { TabBar } from "./TabBar";
import { Placeholder } from "./Placeholder";
import type { TabItem } from "./types";

type Props = {
  tabs: TabItem[];
  active: string;
  onSelect: (id: string) => void;
  /** Active tab body — rendered in the right pane. */
  children: ReactNode;
};

/**
 * Presentational app shell. Topbar + left-column chrome are P3 placeholders;
 * the right pane mounts the active tab body. Responsive reflow lives in shell.scss.
 */
export function Shell({ tabs, active, onSelect, children }: Props) {
  return (
    <>
      <div className="rs-topbar">
        <Placeholder label="Topbar" hint="Lv · XP · Rest · Level Up · Edit · Theme (P4a)" />
      </div>
      <div className="rs-body">
        <div className="rs-sheet">
          <div className="rs-pad">
            <div className="rs-twopane">
              <div className="rs-left">
                <Placeholder label="Header" hint="portrait · name · class · alignment (P4b)" />
                <Placeholder label="Vitals" hint="HP · AC (P4c)" />
                <Placeholder label="Sub-stats" hint="Init · HD · Move (P4d)" />
                {/* Saves & Skills only lives in the left rail when expanded; collapsed,
                    it renders inside the Actions tab content (P4d/P6). */}
                <div className="rs-rail-extra">
                  <Placeholder label="Saves & Skills" hint="D/W/P/B/S · exploration — expanded rail (P4d)" />
                </div>
              </div>
              <div className="rs-right">
                <TabBar tabs={tabs} active={active} onSelect={onSelect} />
                <div id="rs-tabpanel" role="tabpanel">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
        <TabRail tabs={tabs} active={active} onSelect={onSelect} />
      </div>
    </>
  );
}
