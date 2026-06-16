import { SavesExploration } from "./SavesExploration";

export default { title: "Actions / SavesExploration" };

export const Default = () => (
  <SavesExploration
    saves={[
      { key: "death", label: "Death", icon: "fas fa-skull-crossbones", target: 13 },
      { key: "wand", label: "Wand", icon: "fas fa-magic", target: 14 },
      { key: "paralysis", label: "Paralysis", icon: "fas fa-bolt", target: 13 },
      { key: "breath", label: "Breath", icon: "fas fa-wind", target: 16 },
      { key: "spell", label: "Spell", icon: "fas fa-hat-wizard", target: 15 },
    ]}
    exploration={[
      { key: "ld", label: "Listen Door", icon: "fas fa-ear", inSix: 2 },
      { key: "od", label: "Open Door", icon: "fas fa-door-open", inSix: 2 },
      { key: "sd", label: "Find Door", icon: "fas fa-magnifying-glass", inSix: 1 },
      { key: "ft", label: "Find Trap", icon: "fas fa-radar", inSix: 1 },
    ]}
  />
);
