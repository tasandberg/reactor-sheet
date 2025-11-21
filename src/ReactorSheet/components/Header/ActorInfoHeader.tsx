import type { OSEActor } from "@src/ReactorSheet/types/types";
import { InlineInput } from "../InlineInput";
import {
  Column,
  Row,
  Text,
  TextLarge,
  TextSmall,
  TextTiny,
} from "../shared/elements";
import ActorImage from "./ActorImage";
import { colors } from "../shared/elements-vars";

export default function ActorInfoHeader({
  actor,
  handleChange,
}: {
  actor: OSEActor;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  xpProgress: number;
}) {
  return (
    <Row $align="start" $gap="md" style={{ height: "auto" }}>
      <div
        style={{
          minWidth: "70px",
          width: "70px",
          height: "70px",
        }}
      >
        <ActorImage />
      </div>
      <Column
        $gap="none"
        $justify="start"
        $align="start"
        style={{
          height: "100%",
          minWidth: 190,
        }}
      >
        <Text $size="xl" $weight="bold" $font="modesto">
          <InlineInput
            type="text"
            name="name"
            placeholder="Character Name"
            defaultValue={actor.name}
            style={{ paddingLeft: 0 }}
            onBlur={handleChange}
          />
        </Text>
        <Text $color="label">
          {`Level ${actor.system.details.level} ${actor.system.details.class}`}
        </Text>
      </Column>
      <Column
        $gap="none"
        $justify="center"
        style={{
          padding: 4,
          border: `2px double ${colors.hint}`,
          backgroundColor: colors.bgDark2,
          borderRadius: 4,
          width: 100,
          height: "100%",
        }}
      >
        <TextSmall $color="label">HP</TextSmall>
        <TextLarge $font="sans">{actor.system.hp.value}</TextLarge>

        <TextTiny $color="label">Max: {actor.system.hp.max}</TextTiny>
      </Column>
      <Column
        $gap="none"
        $justify="center"
        style={{
          padding: 4,
          border: `2px double ${colors.hint}`,
          backgroundColor: colors.bgDark2,
          borderRadius: 4,
          width: 100,
          height: "100%",
        }}
      >
        <TextSmall $color="label">AC</TextSmall>
        <TextLarge $font="sans">{actor.system.aac.value}</TextLarge>
        <TextTiny $color="label">Base: {actor.system.aac.base}</TextTiny>
      </Column>
    </Row>
  );
}
