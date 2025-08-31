import { useReactorSheetContext } from "../context";

export default function ActionsPage() {
  const { items } = useReactorSheetContext();
  console.log(items);
  return (
    <div>
      {items
        .filter((i) => i.type === "weapon")
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
