import { useReactorSheetContext } from "@src/ReactorSheet/components/context";
import GridManager from "./GridManager";
import { buildGridState } from "./grid-utils";

export default function GridView() {
  const { items, actor } = useReactorSheetContext();
  const gridState = buildGridState(items);
  return <GridManager actorItems={items} gridState={gridState} actor={actor} />;
}
