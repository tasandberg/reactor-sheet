import { useReactorSheetContext } from "./context";
import ScoreBox from "./ScoreBox";

export default function Header() {
  const { actor, source } = useReactorSheetContext();
  const { hp } = source.system;
  console.log(actor);
  return (
    <header className="pb-4">
      <div className="flex-row align-center justify-start">
        <img
          src={String(actor.img)}
          alt={actor.name}
          width="100%"
          data-edit="img"
          style={{ width: "100px", height: "100px", borderRadius: "10px" }}
        />
        <div className="flex-col gap-0">
          <div className="flex-row align-center justiy-content-space-between">
            <h1 className="m-0">{actor.name}</h1>
            <div className="p-0 w-100">
              {hp.value} / {hp.max}
            </div>
          </div>
          <ScoreBox actor={actor} />
        </div>
      </div>
      <div></div>A
    </header>
  );
}
