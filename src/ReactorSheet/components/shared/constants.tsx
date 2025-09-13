import type { OSEActor, OseWeapon } from "@src/ReactorSheet/types/types";
import { Badge } from "./elements";

export type GridTableColumn<T> = {
  header: string;
  getValue?: (row: T) => string | number | undefined;
  name: string;
  renderCell?: (row: T) => React.ReactNode;
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end";
  width?: string;
};

export const actionColumns = (
  actor: OSEActor
): GridTableColumn<OseWeapon>[] => {
  const scores = actor.system.scores;
  return [
    {
      header: "",
      name: "image",
      justify: "start",
      width: "40px",
      renderCell: (item) => (
        <div style={{ width: "25px" }}>
          <img
            src={item.img}
            alt={item.name}
            className="item-image"
            width="100%"
          />
        </div>
      ),
    },
    {
      header: "Attack",
      name: "name",
      justify: "start",
      align: "start",
      width: "1fr",
      renderCell: (item) => (
        <div>
          <div>{item.name}</div>
          <div className="flex-row" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
            {item.system.qualities.map((q, i) => (
              <Badge
                key={`qt${i}${q.label}`}
                title={q.label}
                style={{ display: "inline" }}
                className="badge"
              >
                {q.label}
                <i className={q.icon} />{" "}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      header: "Damage",
      name: "damage",
      justify: "start",
      align: "center",
      width: "min-content",
      renderCell: (item) => {
        const type = item.system.melee ? "melee" : "missile";
        let mod = "";
        let operand = "";
        if (item.system.melee && scores.str.mod !== 0) {
          operand = scores.str.mod > 0 ? "+" : "";
          mod = ` ${operand}${scores.str.mod}`;
        }
        if (item.system.missile && scores.dex.mod !== 0) {
          operand = scores.dex.mod > 0 ? "+" : "";
          mod = ` ${operand}${scores.dex.mod}`;
        }
        return (
          <button
            style={{ width: 100 }}
            onClick={() =>
              actor.targetAttack({ roll: {} }, type, { type, skipDialog: true })
            }
          >
            {item.system.damage}
            {mod}
          </button>
        );
      },
    },
    // Separate modifiers column?
  ];
};
