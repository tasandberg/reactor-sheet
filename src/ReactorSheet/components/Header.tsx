import ActorInfo from "./ActorInfo";
import { useReactorSheetContext } from "./context";

export default function Header() {
  const { actor } = useReactorSheetContext();

  return (
    <header>
      <div className="flex-row align-start justify-start">
        <img
          src={String(actor.img)}
          alt={actor.name}
          width="100%"
          style={{ width: "125px", height: "125px", borderRadius: "10px" }}
        />
        <div className="flex-col gap-0">
          <ActorInfo actor={actor} />
        </div>
      </div>
    </header>
  );
}
