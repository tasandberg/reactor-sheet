import { useReactorSheetContext } from "../../context";
import { selectFeatures } from "../../../viewModels/features";
import { SectionTitle } from "../../ui/SectionTitle";
import { createAbility } from "./createAbility";
import { FeatureCard } from "./FeatureCard";
import { LanguagesSection } from "./LanguagesSection";

export default function Abilities() {
  const { actor } = useReactorSheetContext();
  const features = selectFeatures(actor);

  // New abilities seed their requirements from the actor's class so they sort in
  // with the rest; the create flow opens the sheet to fill in the details.
  const onAdd = () => createAbility(actor, actor.system.details.class || "");

  return (
    <div className="rs-abilities-tab">
      <section className="rs-section rs-feat-sec">
        <div className="rs-feat-head">
          <SectionTitle>Abilities</SectionTitle>
          <button
            type="button"
            className="rs-feat-add"
            title="Add ability"
            aria-label="Add ability"
            onClick={onAdd}
          >
            <i className="fas fa-plus" aria-hidden="true" />
          </button>
        </div>
        {features.length === 0 ? (
          <p className="rs-flavour">No abilities yet.</p>
        ) : (
          <div className="fvtt-feats">
            {features.map((f) => (
              <FeatureCard key={f.id} feature={f} />
            ))}
          </div>
        )}
      </section>
      <LanguagesSection />
    </div>
  );
}
