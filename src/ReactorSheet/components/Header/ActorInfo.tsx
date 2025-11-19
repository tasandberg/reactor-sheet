import { useReactorSheetContext } from "../context";
import { Column } from "../shared/elements";
import React from "react";
import { getNextLevelXp, getPreviousLevelXp } from "@src/lib/class-data";
import ActorInfoHeader from "./ActorInfoHeader";
import CharacterDetails from "./CharacterDetails";

export default function ActorInfo() {
  const { actor, updateActor, oseMode } = useReactorSheetContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateActor({ [name]: value });
  };

  const nextLevel = getNextLevelXp(
    actor.system.details.class,
    Number(actor.system.details.level)
  );

  const previousLevel = getPreviousLevelXp(
    actor.system.details.class,
    Number(actor.system.details.level)
  );

  const xpProgress = Math.floor(
    ((actor.system.details.xp.value - previousLevel) /
      (nextLevel - previousLevel)) *
      100
  );

  return (
    <Column $gap="sm" className="p-3 pt-1">
      <ActorInfoHeader
        actor={actor}
        handleChange={handleChange}
        xpProgress={xpProgress}
      />
      <Column $gap="sm" $align="start">
        <CharacterDetails
          actor={actor}
          handleChange={handleChange}
          oseMode={oseMode}
        />
      </Column>
    </Column>
  );
}
