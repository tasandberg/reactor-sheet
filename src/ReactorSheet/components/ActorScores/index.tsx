import { useReactorSheetContext } from "../context";
import ScoreBox from "./ScoreBox";
import "./ScoreBox.scss";

export default function ActorScores() {
  const { actor } = useReactorSheetContext();
  const scores = [
    {
      name: "str",
      score: actor?.system.scores.str,
      fieldName: "system.scores.str",
    },
    {
      name: "dex",
      score: actor?.system.scores.dex,
      fieldName: "system.scores.dex",
    },
    {
      name: "con",
      score: actor?.system.scores.con,
      fieldName: "system.scores.con",
    },
    {
      name: "int",
      score: actor?.system.scores.int,
      fieldName: "system.scores.int",
    },
    {
      name: "wis",
      score: actor?.system.scores.wis,
      fieldName: "system.scores.wis",
    },
    {
      name: "cha",
      score: actor?.system.scores.cha,
      fieldName: "system.scores.cha",
    },
  ];

  return (
    <div className="flex-row justify-between border-rounded pl-2 pr-2">
      {scores.map(({ name, score }) => (
        <ScoreBox
          key={`score-box-container-${name}`}
          label={name}
          value={score?.value ?? 0}
          mod={score.mod < 0 ? String(score.mod) : `+${score.mod}`}
          rollScore={(event: Event) =>
            actor.rollCheck(name, { event, fastForward: true })
          }
        />
      ))}
    </div>
  );
}
