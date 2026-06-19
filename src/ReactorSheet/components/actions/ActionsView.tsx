import { useState } from "react";
import type { OSEActor, OSESave } from "../../types/types";
import type { RollSpec } from "../../viewModels/types";
import { selectAbilities } from "../../viewModels/abilities";
import { selectAttacks } from "../../viewModels/attacks";
import { selectSaves } from "../../viewModels/saves";
import { selectExploration } from "../../viewModels/exploration";
import { AbilityPlaques } from "./AbilityPlaques";
import { AttacksTable } from "./AttacksTable";
import { MemorizedSpells } from "./MemorizedSpells";
import { SavesGrid, ExplorationGrid } from "./SavesExploration";
import { SectionTitle } from "../ui/SectionTitle";
import { cx } from "../ui/cx";

type Props = { actor: OSEActor };
type SubTab = "attacks" | "spells" | "saves" | "exploration";

/** Actions tab body. At MEDIUM width the sections are a horizontal sub-tab nav
 *  (Attacks/Spells/Saving Throws/Exploration); at xs + lg they stack (and at lg
 *  Saves/Exploration live in the left rail via .actions-only — see SheetShell).
 *  The nav + tab-switching are CSS-gated to medium; abilities stay always-visible. */
export function ActionsView({ actor }: Props) {
  const [subtab, setSubtab] = useState<SubTab>("attacks");

  const onAbility = (key: string) => actor.rollCheck(key, {});
  // Hit/Damage are custom formula rolls (OSE has no separate hit/damage roll).
  const onRoll = (spec: RollSpec) => {
    const speaker = ChatMessage.getSpeaker({ actor });
    // fvtt-types' toMessage data typing is overly strict; pass the message data loosely.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void new Roll(spec.formula).toMessage({ speaker, flavor: spec.flavor } as any);
  };
  // The composite "Attack" uses OSE's own weapon roll dialog.
  const onAttack = (itemId: string) =>
    actor.system.weapons.find((w) => w._id === itemId)?.rollWeapon({ skipDialog: false });
  const onSave = (key: OSESave) => actor.rollSave(key, {});
  const onExploration = (key: string) => actor.rollExploration(key, {});

  const attacks = selectAttacks(actor);
  const memorizedCount = Object.values(actor.system.spells?.spellList ?? {})
    .flat()
    .filter((s) => (s.system.cast ?? 0) > 0 || (s.system.memorized ?? 0) > 0).length;

  const tabs: { key: SubTab; label: string; count?: number }[] = [
    { key: "attacks", label: "Attacks", count: attacks.length },
    { key: "spells", label: "Spells", count: memorizedCount },
    { key: "saves", label: "Saving Throws" },
    { key: "exploration", label: "Exploration" },
  ];

  return (
    <>
      <AbilityPlaques abilities={selectAbilities(actor)} onRoll={onAbility} />

      {/* Horizontal sub-nav — shown only at medium width (CSS); hidden at xs + lg. */}
      <nav className="rs-act-subnav" role="tablist" aria-label="Actions sections">
        {tabs.map((t) => (
          <button
            type="button"
            role="tab"
            key={t.key}
            aria-selected={subtab === t.key}
            className={cx("rs-act-tab", subtab === t.key && "active")}
            onClick={() => setSubtab(t.key)}
          >
            {t.label}
            {t.count != null && t.count > 0 && <span className="rs-act-tab-n">{t.count}</span>}
          </button>
        ))}
      </nav>

      <div className={cx("rs-act-sec", subtab === "attacks" && "is-active")}>
        <AttacksTable attacks={attacks} onRoll={onRoll} onAttack={onAttack} />
      </div>
      <div className={cx("rs-act-sec", subtab === "spells" && "is-active")}>
        <MemorizedSpells actor={actor} />
      </div>
      {/* .actions-only: hidden at lg (Saves/Exploration live in the rail there). */}
      <div className={cx("rs-act-sec", "actions-only", subtab === "saves" && "is-active")}>
        <section className="rs-section">
          <SectionTitle hint="roll-above d20">Saving Throws</SectionTitle>
          <SavesGrid saves={selectSaves(actor)} onRoll={onSave} />
        </section>
      </div>
      <div className={cx("rs-act-sec", "actions-only", subtab === "exploration" && "is-active")}>
        <section className="rs-section">
          <SectionTitle hint="1-in-6">Exploration</SectionTitle>
          <ExplorationGrid exploration={selectExploration(actor)} onRoll={onExploration} />
        </section>
      </div>
    </>
  );
}
