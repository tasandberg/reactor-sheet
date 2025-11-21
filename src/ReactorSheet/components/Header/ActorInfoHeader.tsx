import type { OSEActor } from "@src/ReactorSheet/types/types";
import { InlineInput } from "../InlineInput";
import { Column, Row, Text } from "../shared/elements";
import ActorImage from "./ActorImage";
import ActorInfoHeaderHP from "./ActorInfoHeaderHP";
import ActorInfoHeaderAC from "./ActorInfoHeaderAC";

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
      <Row $width={100} style={{ height: 70 }} $gap="md" $align="start">
        <ActorInfoHeaderHP />
        <ActorInfoHeaderAC />
      </Row>
    </Row>
  );
}
