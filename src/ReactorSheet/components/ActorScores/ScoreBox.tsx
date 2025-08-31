import getLabel from "@src/util/getLabel";

export default function ScoreBox({
  label,
  value,
  mod,
  rollScore,
}: {
  label: string;
  value: number;
  mod: string;
  rollScore: (event: Event) => void;
}) {
  const longLabel = getLabel(`OSE.scores.${label}.long`);
  return (
    <div className="score-box-container">
      <div className="score-box">
        <span className="header-style">{getLabel(label)}</span>
        <a
          className="score-box-value"
          onClick={(e) => rollScore(e.nativeEvent)}
          title={`Roll ${longLabel} check (${mod})`}
        >
          <span style={{ color: "white", fontSize: "1.1rem", flexGrow: 1 }}>
            {value}
          </span>
        </a>
      </div>
      {mod && <div className="mod-box">{mod}</div>}
    </div>
  );
}
