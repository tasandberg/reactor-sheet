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
  /** Optional chrome slots; each falls back to its placeholder. */
  topbar?: ReactNode;
  header?: ReactNode;
  railExtra?: ReactNode;
};

/**
 * Presentational app shell. Chrome regions are slots (placeholder fallback);
 * the right pane mounts the active tab body. Responsive reflow lives in shell.scss.
 */
export function Shell({ tabs, active, onSelect, children, topbar, header, railExtra }: Props) {
  return (
    <>
      <div className="rs-topbar">
        {topbar ?? <Placeholder label="Topbar" hint="Lv · XP · Rest · Level Up · Edit · Theme (P4a)" />}
      </div>
      <div className="rs-body">
        <div className="rs-sheet">
          <div className="rs-pad">
            <div className="rs-twopane">
              <div className="rs-left">
                {header ?? <Placeholder label="Header" hint="portrait · name · class · alignment · vitals (P4b)" />}
                <div className="rs-rail-extra">
                  {railExtra ?? <Placeholder label="Saves & Skills" hint="D/W/P/B/S · exploration — expanded rail (P4d)" />}
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
