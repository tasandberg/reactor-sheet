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

function getModString(mod: number) {
  return mod >= 0 ? `+ ${mod}` : `- ${Math.abs(mod)}`;
}

export const actionColumns = (
  actor: OSEActor
): GridTableColumn<OseWeapon>[] => {
  const scores = actor.system.scores;

  return [
    {
      header: "",
      name: "image",
      justify: "start",
      width: "30px",
      renderCell: (item) => (
        <div style={{ width: "30px" }}>
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
      align: "center",
      width: "40%",
      getValue: (item) => item.name,
    },
    {
      header: "Hit",
      name: "hit",
      justify: "start",
      align: "center",
      width: "max-content",
      renderCell: (item) => {
        let mod = "";
        if (item.system.melee && scores.str.mod !== 0) {
          mod = getModString(scores.str.mod);
        }
        if (item.system.missile && scores.dex.mod !== 0) {
          mod = getModString(scores.dex.mod);
        }
        return <button>{mod}</button>;
      },
    },
    {
      header: "Damage",
      name: "damage",
      justify: "start",
      align: "center",
      width: "max-content",
      renderCell: (item) => {
        const type = item.system.melee ? "melee" : "missile";
        console.log(item.name, type);
        let mod = "";
        if (item.system.melee && scores.str.mod !== 0) {
          mod = getModString(scores.str.mod);
        }
        if (item.system.missile && scores.dex.mod !== 0) {
          mod = getModString(scores.dex.mod);
        }
        return (
          <div style={{ width: "100%" }}>
            <button
              style={{ width: "75px" }}
              onClick={() => actor.targetAttack({ roll: {} }, type, { type })}
            >
              {item.system.damage} {mod}
            </button>
          </div>
        );
      },
    },
    {
      header: "Notes",
      name: "notes",
      justify: "start",
      align: "center",
      width: "max-content",
      renderCell: (item) => (
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
      ),
    },
    // Separate modifiers column?
  ];
};
