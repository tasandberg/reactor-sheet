import { Topbar } from "./Topbar";

export default { title: "Chrome / Topbar" };

export const Default = () => (
  <Topbar vm={{ level: 3, nextLevel: 4, xp: { value: 6420, next: 10000 } }} />
);
