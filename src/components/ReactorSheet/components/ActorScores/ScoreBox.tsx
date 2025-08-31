import getLabel from "@src/util/getLabel";

export default function ScoreBox({
  label,
  value,
  mod,
}: {
  label: string;
  value: number;
  mod: string;
}) {
  return (
    <div className="score-box-container">
      <div className="score-box">
        <span className="header-style">{getLabel(label)}</span>
        <span>{value}</span>
      </div>
      {mod && <div className="mod-box">{mod}</div>}
    </div>
  );
}
