import type { SyntheticEvent } from "react";
import { useReactorSheetContext } from "../../context";
import { TextSmall } from "../../shared/elements";
import ActionTable from "./ActionTable";
import { diceIcon } from "../../shared/elements-vars";

type AdventuringAction = {
  name: string;
  icon: string;
  action: string;
};
const adventuringActions = [
  { name: "Listen Door", icon: "fas fa-ear", action: "ld" },
  { name: "Open Door", icon: "fas fa-door-open", action: "od" },
  { name: "Find Door", icon: "fas fa-magnifying-glass", action: "sd" },
  { name: "Find Trap", icon: "fas fa-radar", action: "ft" },
];

export default function Exploration() {
  const { actor } = useReactorSheetContext();
  const rollAction = (e: SyntheticEvent, action: string) => {
    e.preventDefault();
    actor.rollExploration(action, {});
  };

  return (
    <ActionTable<AdventuringAction>
      title="EXPLORATION"
      columnRepeat={2}
      showHeader={false}
      columns={[
        {
          name: "Action",
          header: "Action",
          align: "center",
          justify: "start",
          width: "1fr",
          renderCell: (item: AdventuringAction) => (
            <TextSmall
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <i className={item.icon} />
              {item.name}
            </TextSmall>
          ),
        },
        {
          name: "Success",
          header: "Success",
          align: "center",
          justify: "start",
          width: "1fr",
          renderCell: (item: AdventuringAction) => {
            return (
              <a
                className="inline-roll roll"
                data-tooltip-text={item.name + " Check"}
                onClick={(e) => rollAction(e, item.action)}
              >
                <i className={diceIcon.d6} />
                {actor.system.exploration[item.action]}-in-6
              </a>
            );
          },
        },
      ]}
      getRowId={(item) => `${item.name}-action-row`}
      data={adventuringActions}
    />
  );
}
