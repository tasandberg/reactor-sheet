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
  return mod >= 0 ? `+${mod}` : `-${Math.abs(mod)}`;
}

export const actionColumns = (
  actor: OSEActor
): GridTableColumn<OseWeapon>[] => {
  const scores = actor.system.scores;

  return [
    {
      header: "Item",
      name: "image",
      justify: "start",
      width: "30px",
      renderCell: (item) => {
        return (
          <div style={{ width: "30px" }}>
            <button
              onClick={() => item.rollWeapon({ skipDialog: false })}
              style={{ padding: 0, border: "none", background: "none" }}
            >
              <img
                src={item.img}
                alt={item.name}
                className="item-image"
                width="100%"
              />
            </button>
          </div>
        );
      },
    },
    {
      header: "",
      name: "name",
      justify: "start",
      align: "center",
      width: "auto",
      renderCell: (item) => (
        <a onClick={() => item.sheet.render(true)}>{item.name}</a>
      ),
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
    {
      header: "Hit",
      name: "hit",
      justify: "center",
      align: "center",
      width: "max-content",
      renderCell: (item) => {
        let mod = "+0";
        if (item.system.melee && scores.str.mod !== 0) {
          mod = getModString(scores.str.mod);
        }
        if (item.system.missile && scores.dex.mod !== 0) {
          mod = getModString(scores.dex.mod);
        }
        return (
          <div
            style={{
              textAlign: "center",
              minWidth: "40px",
            }}
          >
            {mod}
          </div>
        );
      },
    },
    {
      header: "Damage",
      name: "damage",
      justify: "center",
      align: "center",
      width: "max-content",
      renderCell: (item) => {
        const type = item.system.melee ? "melee" : "missile";
        console.log(item.name, type);
        let mod = "";
        if (item.system.melee && scores.str.mod !== 0) {
          mod = getModString(scores.str.mod);
        }

        return (
          <div
            style={{
              textAlign: "center",
              minWidth: "75px",
            }}
          >
            {item.system.damage}
            {mod}
          </div>
        );
      },
    },

    {
      header: "Attack!",
      name: "roll",
      justify: "center",
      align: "center",
      width: "max-content",
      renderCell: (item) => {
        return (
          <button
            key={`${item.id}-attack-button`}
            style={{ width: "50px" }}
            onClick={() => item.rollWeapon({ skipDialog: false })}
          >
            <i className="fas fa-dice-d20" />
          </button>
        );
      },
    },
  ];
};
