import type { ReactNode } from "react";
import type { FeatureGroupVM } from "../../../viewModels/features";
import { SectionTitle } from "../../ui/SectionTitle";
import { FeatureCard } from "./FeatureCard";

/** Section header: display-font title + italic class/race hint + a + add button. */
export function FeatureSectionHeader({
  title,
  hint,
  label,
  onAdd,
}: {
  title: string;
  hint?: ReactNode;
  /** Used only for the add button's accessible label. */
  label: string;
  onAdd?: () => void;
}) {
  return (
    <div className="rs-feat-head">
      <SectionTitle hint={hint}>{title}</SectionTitle>
      {onAdd && (
        <button
          type="button"
          className="rs-feat-add"
          title={`Add ${label} ability`}
          aria-label={`Add ${label} ability`}
          onClick={onAdd}
        >
          <i className="fas fa-plus" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

type Props = {
  group: FeatureGroupVM;
  /** Adds a new ability seeded to this group's class/race slug. */
  onAdd?: (slug: string) => void;
};

/**
 * One class/race feature section: a display-font title ("Class Features" for the
 * actor's own class, else the group's own name) with an italic hint naming the
 * class/race, a + button to add an ability, and the group's expandable cards.
 * Renders nothing when the group has no features.
 */
export function FeatureSection({ group, onAdd }: Props) {
  if (!group.features.length) return null;
  const title = group.isOwnClass ? "Class Features" : `${group.label} Features`;
  const hint = group.isOwnClass ? group.label : undefined;

  return (
    <section className="rs-section rs-feat-sec">
      <FeatureSectionHeader
        title={title}
        hint={hint}
        label={group.label}
        onAdd={onAdd && (() => onAdd(group.slug))}
      />
      <div className="fvtt-feats">
        {group.features.map((f) => (
          <FeatureCard key={f.id} feature={f} />
        ))}
      </div>
    </section>
  );
}
