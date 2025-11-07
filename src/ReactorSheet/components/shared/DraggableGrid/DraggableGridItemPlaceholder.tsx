import { colors } from "../elements-vars";

export default function DraggableGridItemPlaceholder() {
  const style = {
    width: "4rem",
    height: "78px",
    opacity: "0.5",
    border: `1px dashed ${colors.primary}`,
  };
  return <div style={style} />;
}
