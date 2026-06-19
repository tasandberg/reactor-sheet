import { useReactorSheetContext } from "../../context";
import { selectFeatures } from "../../../viewModels/features";
import { Column, TextLarge } from "../../shared/elements";
import Languages from "../Notes/Languages";
import { FeatureCard } from "./FeatureCard";

export default function Abilities() {
  const { actor } = useReactorSheetContext();
  const features = selectFeatures(actor);

  return (
    <Column $justify="start" $align="start" $gap="md">
      <TextLarge>Abilities</TextLarge>
      <div className="fvtt-feats">
        {features.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
      <Languages />
    </Column>
  );
}
