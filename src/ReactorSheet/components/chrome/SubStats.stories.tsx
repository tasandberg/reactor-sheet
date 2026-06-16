import { SubStats } from "./SubStats";

export default { title: "Chrome / SubStats" };

export const Default = () => (
  <SubStats vm={{ hp: { value: 8, max: 9 }, ac: { ascending: 12, descending: 7 }, initMod: 1, hd: "3d4", move: 120 }} />
);
