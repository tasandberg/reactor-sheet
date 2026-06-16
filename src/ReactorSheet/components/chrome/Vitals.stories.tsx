import { Vitals } from "./Vitals";

export default { title: "Chrome / Vitals" };

export const Default = () => (
  <Vitals vm={{ hp: { value: 8, max: 9 }, ac: { ascending: 12, descending: 7 }, initMod: 1, hd: "3d4", move: 120 }} />
);
