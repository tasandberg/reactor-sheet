import ActorImage from "./ActorImage";
import ActorInfo from "./ActorInfo";

export default function Header() {
  return (
    <header style={{ position: "relative" }}>
      <div className="flex-row align-start justify-start gap-0">
        <ActorImage />
        <ActorInfo />
      </div>
    </header>
  );
}
