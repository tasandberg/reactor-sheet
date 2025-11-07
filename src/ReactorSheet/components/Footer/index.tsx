import { useReactorSheetContext } from "../context";
import { Column, Row, Text, TextSmall } from "../shared/elements";
import { colors } from "../shared/elements-vars";

export default function Footer() {
  const { actor } = useReactorSheetContext();
  const treasures = Object.values(actor.system.treasures);

  const currencies = ["GP", "SP", "CP", "PP", "EP"]
    .map((cur) => treasures.find((t) => t.name === cur))
    .filter((t) => !!t);

  return (
    <div
      style={{
        gridArea: "footer",
        padding: "0.5rem",
        background: "#222",
        position: "absolute",
        bottom: 0,
        height: "100px",
        width: "100%",
        borderTop: "1px solid #444",
        boxShadow: "0 -2px 4px rgba(0,0,0,0.5)",
        backgroundColor: colors.bgDark,
        zIndex: 2,
      }}
      className="flex-col justify-center align-center gap-0"
    >
      <Row>
        <Column $align="start" style={{ height: "100%" }}>
          <Text $color="label">Movement</Text>
          <Row style={{ flexWrap: "wrap" }}>
            <div>
              <TextSmall $color="label">Encounter: </TextSmall>
              <TextSmall>{actor.system.movement.encounter + " ft."}</TextSmall>
            </div>
            <div>
              <TextSmall $color="label">Travel: </TextSmall>
              <TextSmall>{actor.system.movement.overland + " miles"}</TextSmall>
            </div>
            <div>
              <TextSmall $color="label">Explore: </TextSmall>
              <TextSmall>{actor.system.movement.base + " ft."}</TextSmall>
            </div>
          </Row>
        </Column>
        <Column $align="start" style={{ height: "100%" }}>
          <Text $color="label">Wealth</Text>
          <Row style={{ flexWrap: "wrap" }}>
            {currencies.map((cur) => (
              <Row
                key={`footer-${cur.name}`}
                style={{ gap: 2, width: "auto", marginRight: 4 }}
              >
                <img src={cur?.img} width="14" />
                <TextSmall $color="label">{cur?.name}: </TextSmall>
                <TextSmall $color="emphatic">
                  {cur?.system.quantity.value}
                </TextSmall>
              </Row>
            ))}
          </Row>
        </Column>
      </Row>
    </div>
  );
}
