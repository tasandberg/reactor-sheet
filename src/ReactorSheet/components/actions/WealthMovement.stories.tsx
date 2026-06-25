import { WealthMovement } from "./WealthMovement";

export default { title: "Actions / WealthMovement" };

export const Default = () => (
  <WealthMovement
    vm={{
      coins: [
        { name: "GP", img: "", qty: 42 },
        { name: "SP", img: "", qty: 17 },
      ],
      move: { encounter: 40, explore: 120, travel: 24 },
    }}
  />
);
