import type { OSEActor, OSESave } from "../../types/types";
import type { RollSpec } from "../../viewModels/types";
import { selectAbilities } from "../../viewModels/abilities";
import { selectAttacks } from "../../viewModels/attacks";
import { selectSaves } from "../../viewModels/saves";
import { selectExploration, rollExploration } from "../../viewModels/exploration";
import { postRollCard } from "../../chat/attackCard";
import { AbilityPlaques } from "./AbilityPlaques";
import { AttacksTable } from "./AttacksTable";
import { MemorizedSpells } from "./MemorizedSpells";
import { SavesGrid, ExplorationGrid } from "./SavesExploration";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { actor: OSEActor };

/** Actions tab body — all sections stack (Abilities, Attacks, Spells, and at xs +
 *  md Saves/Exploration). At lg, Saves/Exploration live in the left rail instead,
 *  so they carry .actions-only (hidden at lg — see SheetShell/shell.scss). */
export function ActionsView({ actor }: Props) {
  const onAbility = (key: string) => actor.rollCheck(key, {});
  // Hit/Damage are custom formula rolls (OSE has no separate hit/damage roll). The
  // Vellum card is target-aware: a hit roll shows HIT/MISS vs the current target's AC,
  // a damage roll offers GMs an apply-damage button. No target → plain card.
  const onRoll = (spec: RollSpec) => void postRollCard(actor, spec);
  // The composite "Attack" uses OSE's own weapon roll dialog.
  const onAttack = (itemId: string) =>
    actor.system.weapons.find((w) => w._id === itemId)?.rollWeapon({ skipDialog: false });
  const onSave = (key: OSESave) => actor.rollSave(key, {});
  const onExploration = (key: string) => rollExploration(actor, key);

  const attacks = selectAttacks(actor);

  return (
    <>
      <AbilityPlaques abilities={selectAbilities(actor)} onRoll={onAbility} />
      <AttacksTable attacks={attacks} onRoll={onRoll} onAttack={onAttack} />
      <MemorizedSpells actor={actor} />
      {/* .actions-only: hidden at lg (Saves/Exploration live in the rail there). */}
      <section className="rs-section actions-only">
        <SectionTitle hint="roll-above d20">Saving Throws</SectionTitle>
        <SavesGrid saves={selectSaves(actor)} onRoll={onSave} />
      </section>
      <section className="rs-section actions-only">
        <SectionTitle hint="1-in-6">Exploration</SectionTitle>
        <ExplorationGrid exploration={selectExploration(actor)} onRoll={onExploration} />
      </section>
    </>
  );
}
