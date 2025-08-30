import { useReactorSheetContext } from "./context";

export default function Header() {
  const { actor, source } = useReactorSheetContext();
  const { hp, scores } = source.system;
  return (
    <header className="p-4">
      <div>
        <img
          src={String(actor.img)}
          alt={actor.name}
          width="100%"
          data-edit="img"
          style={{ width: "100px", height: "100px", borderRadius: "10px" }}
        />
      </div>
      <div>
        <h1>{actor.name}</h1>
      </div>
      <div className="p-0">
        {hp.value} / {hp.max}
      </div>
      <div>
        {for (const [key, value] of Object.entries(scores)) {
          <div key={key} className="inline-block mr-2">
            <strong>{key.toUpperCase()}:</strong> {value.value} (
            {value.mod >= 0 ? "+" : ""}
            {value.mod})
          </div>;
        }}    
      </div>
    </header>
  );
}
