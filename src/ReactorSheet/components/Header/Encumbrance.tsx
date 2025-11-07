import { useReactorSheetContext } from "../context";
import { Row, TextTiny } from "../shared/elements";

export default function Encumbrance() {
  const { actorData } = useReactorSheetContext();
  const { encumbrance } = actorData;

  return (
    <Row $align="center">
      <progress value={encumbrance.value} max={encumbrance.max} />
      <TextTiny>
        {encumbrance.value}/{encumbrance.max}gp
      </TextTiny>
    </Row>
  );
}
