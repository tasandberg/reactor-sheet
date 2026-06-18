import { useState } from "react";
import type { SaveVM, ExplorationVM } from "../../viewModels/types";
import type { OSESave } from "../../types/types";
import { Table, Td, Tr } from "../ui/Table";
import { SectionTitle } from "../ui/SectionTitle";
import { cx } from "../ui/cx";
import { rollable } from "./rollable";

type Props = {
  saves: SaveVM[];
  exploration: ExplorationVM[];
  tabbed?: boolean;
  onRollSave?: (key: OSESave) => void;
  onRollExploration?: (key: string) => void;
};

function SavesTable({ saves, onRoll }: { saves: SaveVM[]; onRoll?: (key: OSESave) => void }) {
  return (
    <Table>
      <tbody>
        {saves.map((s) => (
          <Tr
            key={s.key}
            className={cx(onRoll && "rollable")}
            title={onRoll ? `Roll ${s.label} save` : undefined}
            {...rollable(onRoll && (() => onRoll(s.key)))}
          >
            <Td>
              <i className={s.icon} style={{ marginRight: 8, opacity: 0.7 }} />
              {s.label}
            </Td>
            <Td num>{s.target}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

function ExplorationTable({ exploration, onRoll }: { exploration: ExplorationVM[]; onRoll?: (key: string) => void }) {
  return (
    <Table>
      <tbody>
        {exploration.map((e) => (
          <Tr
            key={e.key}
            className={cx(onRoll && "rollable")}
            title={onRoll ? `Roll ${e.label}` : undefined}
            {...rollable(onRoll && (() => onRoll(e.key)))}
          >
            <Td>
              <i className={e.icon} style={{ marginRight: 8, opacity: 0.7 }} />
              {e.label}
            </Td>
            <Td num>{e.inSix}-in-6</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

/**
 * Saving throws (roll-above) + exploration (1-in-6). Rows roll when handlers
 * are supplied. `tabbed` shows them in a two-tab nav (used in the left rail so
 * the column stays above the fold); otherwise they stack with section titles.
 */
export function SavesExploration({ saves, exploration, tabbed = false, onRollSave, onRollExploration }: Props) {
  const [tab, setTab] = useState<"saves" | "exploration">("saves");

  if (!tabbed) {
    return (
      <section className="rs-section">
        <SectionTitle hint="roll-above d20">Saving Throws</SectionTitle>
        <SavesTable saves={saves} onRoll={onRollSave} />
        <SectionTitle hint="1-in-6">Exploration</SectionTitle>
        <ExplorationTable exploration={exploration} onRoll={onRollExploration} />
      </section>
    );
  }

  return (
    <section className="rs-section">
      <div className="rs-se-nav" role="tablist" aria-label="Saves & Exploration">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "saves"}
          className={cx("rs-se-tab", tab === "saves" && "active")}
          onClick={() => setTab("saves")}
        >
          <i className="fas fa-skull-crossbones" aria-hidden="true" />
          Saves
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "exploration"}
          className={cx("rs-se-tab", tab === "exploration" && "active")}
          onClick={() => setTab("exploration")}
        >
          <i className="fas fa-door-open" aria-hidden="true" />
          Exploration
        </button>
      </div>
      {tab === "saves" ? (
        <SavesTable saves={saves} onRoll={onRollSave} />
      ) : (
        <ExplorationTable exploration={exploration} onRoll={onRollExploration} />
      )}
    </section>
  );
}
