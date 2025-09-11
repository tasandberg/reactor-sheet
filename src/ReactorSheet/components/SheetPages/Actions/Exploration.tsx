import type { SyntheticEvent } from "react";
import { useReactorSheetContext } from "../../context";
import { SectionHeader } from "../../shared/elements";

const adventuringActions = [
  { name: "Listen Door", icon: "fas fa-ear", action: "ld" },
  { name: "Open Door", icon: "fas fa-door-open", action: "od" },
  { name: "Find Door", icon: "fas fa-magnifying-glass", action: "sd" },
  { name: "Find Trap", icon: "fas fa-triangle-exclamation", action: "ft" },
];

export default function Exploration() {
  const { actor } = useReactorSheetContext();
  const rollAction = (e: SyntheticEvent, action: string) => {
    e.preventDefault();
    actor.rollExploration(action, {});
  };

  return (
    <div>
      <SectionHeader>Exploration</SectionHeader>
      <div className="flex-row flex-wrap">
        {adventuringActions.map((action) => (
          <button
            key={action.name}
            onClick={(e) => rollAction(e, action.action)}
          >
            <i className={action.icon} /> {action.name}
          </button>
        ))}
      </div>
    </div>
  );
}
