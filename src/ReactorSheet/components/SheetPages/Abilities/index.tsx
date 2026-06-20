import { useReactorSheetContext } from "../../context";
import {
  groupFeaturesByClass,
  selectFeatures,
} from "../../../viewModels/features";
import { createAbility } from "./createAbility";
import { FeatureSection, FeatureSectionHeader } from "./FeatureSection";
import { LanguagesSection } from "./LanguagesSection";

export default function Abilities() {
  const { actor } = useReactorSheetContext();
  const features = selectFeatures(actor);
  const groups = groupFeaturesByClass(features, actor.system.details.class);

  const onAdd = (slug: string) => createAbility(actor, slug);

  return (
    <div className="rs-abilities-tab">
      {groups.length === 0 ? (
        // No features yet — still offer a way to create the first one.
        <section className="rs-section rs-feat-sec">
          <FeatureSectionHeader
            title="Class Features"
            hint={actor.system.details.class || undefined}
            label={actor.system.details.class || "Class"}
            onAdd={() => onAdd("")}
          />
          <p className="rs-flavour">No features yet.</p>
        </section>
      ) : (
        groups.map((group) => (
          <FeatureSection key={group.slug} group={group} onAdd={onAdd} />
        ))
      )}
      <LanguagesSection />
    </div>
  );
}
