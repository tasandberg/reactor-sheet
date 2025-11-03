import { Column, TextLarge } from "../../shared/elements";
import PreparedSpells from "./PreparedSpells";
import SpellBook from "./Spellbook";

export default function Spells() {
  return (
    <Column $align="start">
      <TextLarge>Spells</TextLarge>
      <Column $gap="lg" $align="start">
        <PreparedSpells deleteable />
        <SpellBook />
      </Column>
    </Column>
  );
}
