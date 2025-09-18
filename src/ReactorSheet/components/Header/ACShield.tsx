import { useReactorSheetContext } from "../context";
import { ShieldBorder } from "@src/svg/ShieldBorder";

// const ShieldBorder = styled.div`
//   width: 100%;
//   height: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background-image: url("${ShieldBadge}");
//   background-position: center;
//   background-size: contain;
//   background-repeat: no-repeat;
//   border: 1px solid red;
//   color: ${colors.hint};
// `;

export default function ACShield() {
  const { actorData } = useReactorSheetContext();

  return <ShieldBorder width={60} value={actorData.aac.value} />;
}
