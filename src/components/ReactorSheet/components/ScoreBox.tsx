import { useReactorSheetContext } from "./context";
import "../styles/ScoreBox.scss";

export default function ScoreBox() {
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
    <div className="flex-row justify-around border-rounded">
      {scores.map(({ name, score }) => (
        <div
          className="score-box-container"
          key={`score-box-container-${name}`}
        >
          <div className="score-box">
            <span className="header-style">
              {game!.i18n!.localize(`OSE.scores.${name}.short`)}
            </span>
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
