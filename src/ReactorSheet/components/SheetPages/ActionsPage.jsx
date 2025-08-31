import { useReactorSheetContext } from "../context";

export default function ActionsPage() {
  const { items } = useReactorSheetContext();
  return (
    <div>
      {items
        .filter((i) => i.type === "weapon" && i.system.equipped)
        .map((i) => (
          <div key={i._id}>
            <a
              className="item-control item-show"
              onClick={() => i.sheet?.render(true)}
            >
              {i.name}
            </a>
          </div>
        ))}
    </div>
  );
}
