import type { OSEActor } from "../../types/types";
import { selectAbilities } from "../../viewModels/abilities";
import { selectAttacks } from "../../viewModels/attacks";
import { selectSaves } from "../../viewModels/saves";
import { selectExploration } from "../../viewModels/exploration";
import { AbilityPlaques } from "./AbilityPlaques";
import { AttacksTable } from "./AttacksTable";
import { SavesExploration } from "./SavesExploration";

type Props = { actor: OSEActor };

/** Actions tab body. Saves/Exploration render here only when collapsed
 *  (.actions-only); when expanded they live in the left rail (see SheetShell). */
export function ActionsView({ actor }: Props) {
  return (
    <>
      <AbilityPlaques abilities={selectAbilities(actor)} />
      <AttacksTable attacks={selectAttacks(actor)} />
      <div className="actions-only">
        <SavesExploration saves={selectSaves(actor)} exploration={selectExploration(actor)} />
      </div>
    </>
  );
}
