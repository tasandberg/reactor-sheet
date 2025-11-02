import { Row, Text, TextSmall } from "../../shared/elements";

export default function InventorySectionHeader({
  img,
  label,
  helperText,
}: {
  img?: string;
  label: string;
  helperText: string;
}) {
  return (
    <Row $align="center" className="position-relative">
      <Row>
        {img && (
          <img
            src={img}
            alt={`${label} image`}
            style={{ width: "2rem", height: "2rem" }}
          />
        )}
        <Text>{label}</Text>
      </Row>
      {helperText && (
        <Row $justify="flex-end" $align="center" style={{ flexGrow: 1 }}>
          <TextSmall>{helperText}</TextSmall>
        </Row>
      )}
    </Row>
  );
}
