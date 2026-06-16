import { IdentityHeader } from "./IdentityHeader";

export default { title: "Chrome / IdentityHeader" };

export const Default = () => (
  <IdentityHeader
    vm={{ name: "Eldra Vey", img: "", classLabel: "Magic-User", level: 3, alignment: "Neutral", title: "Conjurer" }}
  />
);
