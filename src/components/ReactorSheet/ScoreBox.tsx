import "./styles/ScoreBox.scss";
import type { OSEActor } from "./types/types";

export default function ScoreBox({ actor }: { actor: OSEActor }) {
  const scores = [
    { name: "str", score: actor?.system.scores.str },
    { name: "int", score: actor?.system.scores.int },
    { name: "wis", score: actor?.system.scores.wis },
    { name: "dex", score: actor?.system.scores.dex },
    { name: "con", score: actor?.system.scores.con },
    {
      name: "cha",
      score: actor?.system.scores.cha,
    },
  ];
  console.log(actor?.system.scores.cha);
  return (
    <div className="flex-row justify-around border-rounded">
      {scores.map(({ name, score }) => (
        <div
          className="score-box-container"
          key={`score-box-container-${name}`}
        >
          <div className="score-box">
            <span>{game!.i18n!.localize(`OSE.scores.${name}.short`)}</span>
            <span>{score.value}</span>
          </div>
          <div className="mod-box">
            {score.mod < 0 ? score.mod : `+${score.mod}`}
          </div>
        </div>
      ))}
    </div>
  );
}
