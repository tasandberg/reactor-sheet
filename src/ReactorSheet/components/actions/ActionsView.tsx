import type { OSEActor, OSESave } from "../../types/types";
import type { RollSpec } from "../../viewModels/types";
import { selectAbilities } from "../../viewModels/abilities";
import { selectAttacks } from "../../viewModels/attacks";
import { selectSaves } from "../../viewModels/saves";
import { selectExploration } from "../../viewModels/exploration";
import { AbilityPlaques } from "./AbilityPlaques";
import { AttacksTable } from "./AttacksTable";
import { MemorizedSpells } from "./MemorizedSpells";
import { SavesExploration } from "./SavesExploration";

type Props = { actor: OSEActor };

/** Actions tab body. Saves/Exploration render here only when collapsed
 *  (.actions-only); when expanded they live in the left rail (see SheetShell). */
export function ActionsView({ actor }: Props) {
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

  return (
    <>
      <AbilityPlaques abilities={selectAbilities(actor)} onRoll={onAbility} />
      <AttacksTable attacks={selectAttacks(actor)} onRoll={onRoll} onAttack={onAttack} />
      <MemorizedSpells actor={actor} />
      <div className="actions-only">
        <SavesExploration
          saves={selectSaves(actor)}
          exploration={selectExploration(actor)}
          onRollSave={onSave}
          onRollExploration={onExploration}
        />
      </div>
    </>
  );
}
