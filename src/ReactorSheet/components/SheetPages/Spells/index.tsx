import { Column } from "../../shared/elements";
import PreparedSpells from "./PreparedSpells";
import SpellBook from "./Spellbook";

export default function Spells() {
  return (
    <Column $gap="2rem">
      <PreparedSpells deleteable />
      <SpellBook />
    </Column>
  );
}
