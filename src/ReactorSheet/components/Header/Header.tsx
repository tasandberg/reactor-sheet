import ActorInfo from "./ActorInfo";
import ActorScores from "../ActorScores";

export default function Header() {
  return (
    <header style={{ gridArea: "header" }}>
      <div className="flex-col align-start justify-start gap-0 p-3">
        <ActorInfo />
        {/* <ActorScores /> */}
      </div>
    </header>
  );
}
