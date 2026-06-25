import { Empty } from "reactor-sheet";
import { Button } from "reactor-sheet";

export const NoSpells = () => (
  <Empty
    title="No spells memorized"
    message="Prepare spells from your spellbook to see them here."
    action={<Button variant="primary">Memorize a spell</Button>}
  />
);
