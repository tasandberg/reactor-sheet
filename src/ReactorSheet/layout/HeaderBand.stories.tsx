import { HeaderBand } from "@layout/HeaderBand";

export default { title: "Chrome / HeaderBand" };

export const Default = () => (
  <HeaderBand
    identity={{ name: "Eldra Vey", img: "", classLabel: "Magic-User", level: 3, alignment: "Neutral", title: "Conjurer" }}
    vitals={{ hp: { value: 8, max: 9 }, ac: { ascending: 12, descending: 7 }, initMod: 1, hd: "3d4", move: 120, moveBands: { encounter: 40, explore: 120, travel: 24 } }}
  />
);
