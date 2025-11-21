import { Column, TextLarge, TextSmall } from "../shared/elements";

export default function ActorInfoHeaderAC() {
  return (
    <Column
      $gap="none"
      $align="center"
      $justify="start"
      style={{ height: "100%", padding: 4 }}
    >
      <TextSmall $color="label">AC</TextSmall>
      <TextLarge $color="emphatic">10</TextLarge>
    </Column>
  );
}
