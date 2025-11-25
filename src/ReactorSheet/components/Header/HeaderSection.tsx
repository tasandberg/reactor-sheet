import { Row, TextTiny } from "../shared/elements";
import { colors } from "../shared/elements-vars";

export default function HeaderSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Row
      $align="start"
      style={{
        border: `1px solid ${colors.hint}`,
        borderRadius: 4,
        position: "relative",
        padding: "10px",
      }}
    >
      <TextTiny
        $color="hint"
        style={{
          position: "absolute",
          top: -8,
          left: 8,
          height: 8,
          backgroundColor: colors.bgDark2,
          padding: "0 8px",
        }}
      >
        {label}
      </TextTiny>
      {children}
    </Row>
  );
}
