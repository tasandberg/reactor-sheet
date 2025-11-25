import { useReactorSheetContext } from "../context";
import HeaderSection from "../Header/HeaderSection";
import { TextSmall } from "../shared/elements";

export default function Movement() {
  const { actor } = useReactorSheetContext();

  return (
    <HeaderSection label="Movement">
      <TextSmall $color="label" style={{ width: "100px" }}>
        Speed:
      </TextSmall>
      <TextSmall>{actor.system.movement.encounter + " ft."}</TextSmall>
      <TextSmall>|</TextSmall>
      <TextSmall>{actor.system.movement.overland + " miles"}</TextSmall>
      <TextSmall>|</TextSmall>
      <TextSmall>{actor.system.movement.base + " ft."}</TextSmall>
    </HeaderSection>
  );
}
