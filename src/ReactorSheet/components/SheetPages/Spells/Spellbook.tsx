import { useReactorSheetContext } from "../../context";
import { ActionHeader, Column, Row, Text } from "../../shared/elements";
import SpellbookLevel from "./SpellbookLevel";

export default function SpellBook() {
  const { actor, updateActor } = useReactorSheetContext();

  const spellLevels = Object.entries(actor.system.spells.slots).filter(
    ([, slots]) => slots.used !== undefined
  );

  async function updateSlots(level: number, max: number) {
    if (max < 0) max = 0;
    await updateActor({ [`system.spells.${level}.max`]: max });
  }

  return (
    <Column $gap={"0"}>
      <ActionHeader>
        <Row>
          <img
            src="icons/sundries/books/book-embossed-jewel-blue-red.webp"
            alt="spellbook"
            width="25"
          />
          <Text>Spell Book</Text>
        </Row>
      </ActionHeader>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          width: "100%",
          height: "100%",
          gap: "8px",
        }}
      >
        {spellLevels.map(([level, slots]) => (
          <SpellbookLevel
            key={`spellbook-level-${level}`}
            level={Number(level)}
            slots={slots}
            updateSlots={updateSlots}
            spells={actor.system.spells.spellList[level]}
          />
        ))}
      </div>
    </Column>
  );
}
