import { AttacksTable } from "./AttacksTable";
import type { AttackVM } from "../../viewModels/types";

export default { title: "Actions / AttacksTable" };

const W = (id: string, name: string, kind: "melee" | "missile", hit: string, dmg: string, q: string[]): AttackVM => ({
  id, name, img: "", kind, kindLabel: kind === "melee" ? "Melee" : "Missile", hitLabel: hit, damage: dmg, qualities: q,
});

export const Default = () => (
  <AttacksTable
    attacks={[
      W("d-m", "Dagger", "melee", "+0", "1d4", []),
      W("d-r", "Dagger", "missile", "+1", "1d4", ["Thrown"]),
      W("q-m", "Quarterstaff", "melee", "+0", "1d6", ["Two-handed", "Slow"]),
    ]}
  />
);
