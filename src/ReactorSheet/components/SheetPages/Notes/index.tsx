import { useReactorSheetContext } from "../../context";
import { Column } from "../../shared/elements";
import EditableContent from "./EditableContent";

export default function Notes() {
  const { actor } = useReactorSheetContext();

  return (
    <Column $align="start">
      <EditableContent
        title="Notes"
        height={150}
        name="system.details.notes"
        value={actor.system.details.notes}
      />
      <EditableContent
        title="Biography"
        height={150}
        name="system.details.biography"
        value={actor.system.details.biography}
      />
    </Column>
  );
}
