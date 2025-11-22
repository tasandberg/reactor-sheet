import { useReactorSheetContext } from "../context";
import { TextTiny } from "../shared/elements";
import HeaderSection from "./HeaderSection";

export default function Encumbrance() {
  const { actorData } = useReactorSheetContext();
  const { encumbrance } = actorData;

  return (
    <HeaderSection label="Encumbrance">
      <progress
        value={encumbrance.value}
        max={encumbrance.max}
        style={{ marginTop: 0 }}
      />
      <TextTiny>
        {encumbrance.value}/{encumbrance.max}gp
      </TextTiny>
    </HeaderSection>
  );
}
