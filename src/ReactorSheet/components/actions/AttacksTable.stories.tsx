import { AttacksTable } from "./AttacksTable";
import type { AttackVM } from "../../viewModels/types";

export default { title: "Actions / AttacksTable" };

// strip the " +N(abil)" display suffix to get a rollable formula (keeps the die)
const toFormula = (label: string) => label.replace(/\s*\(.*\)$/, "").replace(/\s+/g, "");
const W = (id: string, name: string, kind: "melee" | "missile", hit: string, dmg: string, q: { label: string; icon: string }[]): AttackVM => ({
  id, itemId: id, name, img: "", kind, kindLabel: kind === "melee" ? "Melee" : "Missile",
  hit: { label: hit, formula: toFormula(hit), flavor: `${name} attack` },
  dmg: { label: dmg, formula: toFormula(dmg), flavor: `${name} damage` },
  qualities: q,
});

export const Default = () => (
  <AttacksTable
    onRoll={(s) => console.log("roll", s)}
    onAttack={(id) => console.log("attack", id)}
    attacks={[
      W("d-m", "Dagger", "melee", "1d20", "1d4", []),
      W("d-r", "Dagger", "missile", "1d20 +1(dex)", "1d4", [{ label: "Thrown", icon: "fa-bullseye-pointer" }]),
      W("q-m", "Quarterstaff", "melee", "1d20 +2(str)", "1d6 +2(str)", [{ label: "Two-handed", icon: "fa-hand-fist" }, { label: "Slow", icon: "fa-hourglass" }]),
    ]}
  />
);
