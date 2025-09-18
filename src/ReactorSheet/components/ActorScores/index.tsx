import getLabel from "@src/util/getLabel";
import { useReactorSheetContext } from "../context";
import { StatBlock } from "@src/svg/StatBlock";
import type { MouseEvent } from "react";

export default function ActorScores() {
  const { actor, actorData } = useReactorSheetContext();
  const scores = [
    {
      name: "str",
      score: actorData.scores.str,
      fieldName: "system.scores.str",
    },
    {
      name: "dex",
      score: actorData.scores.dex,
      fieldName: "system.scores.dex",
    },
    {
      name: "con",
      score: actorData.scores.con,
      fieldName: "system.scores.con",
    },
    {
      name: "int",
      score: actorData.scores.int,
      fieldName: "system.scores.int",
    },
    {
      name: "wis",
      score: actorData.scores.wis,
      fieldName: "system.scores.wis",
    },
    {
      name: "cha",
      score: actorData.scores.cha,
      fieldName: "system.scores.cha",
    },
  ];

  return (
    <>
      {scores.map(({ name, score }) => (
        <StatBlock
          key={`score-box-container-${name}`}
          label={getLabel(`OSE.scores.${name}.short`)}
          width={55}
          value={score?.value ?? 0}
          mod={score?.mod ?? 0}
          rollScore={(event: MouseEvent<SVGTextElement>) =>
            actor.rollCheck(name, { event })
          }
        />
      ))}
    </>
  );
}
