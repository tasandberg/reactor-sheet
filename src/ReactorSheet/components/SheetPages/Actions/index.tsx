import SavingThrows from "../SavingThrows";
import PreparedSpells from "../Spells/PreparedSpells";
import Exploration from "./Exploration";
import Weapons from "./Weapons";
/**
 * TODO:
 * - reference: https://www.dndbeyond.com/characters/91477249
 * - Implement table headers and rows using a grid layout
 *
 */

export default function Actions() {
  return (
    <div className="flex-col">
      <Weapons />
      <PreparedSpells />
      <Exploration />
      <SavingThrows />
    </div>
  );
}
