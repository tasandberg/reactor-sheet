import { useReactorSheetContext } from "../context";
import HeaderSection from "../Header/HeaderSection";
import { Row, TextSmall } from "./elements";

export default function Money() {
  const { actor } = useReactorSheetContext();
  const treasures = Object.values(actor.system.treasures);

  const currencies = ["GP", "SP", "CP", "PP", "EP"]
    .map((cur) => treasures.find((t) => t.name === cur))
    .filter((t) => !!t)
    .filter((t) => t.system.quantity.value > 0)
    .sort((a, b) => b.system.cost - a.system.cost);

  return (
    <HeaderSection label="Wealth">
      {currencies.map((cur) => (
        <Row
          key={`footer-${cur.name}`}
          style={{ gap: 2, width: "auto", marginRight: 4 }}
        >
          <img src={cur?.img} width="14" />
          <TextSmall $color="label">{cur?.name}: </TextSmall>
          <TextSmall $color="emphatic">{cur?.system.quantity.value}</TextSmall>
        </Row>
      ))}
    </HeaderSection>
  );
}
