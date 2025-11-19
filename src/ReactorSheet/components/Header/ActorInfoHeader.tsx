import type { OSEActor } from "@src/ReactorSheet/types/types";
import { InlineInput } from "../InlineInput";
import { Column, Row, Text, TextSmall, TextTiny } from "../shared/elements";
import ActorImage from "./ActorImage";
import { colors } from "../shared/elements-vars";
import HitPoints from "./HitPoints";
import GenericProgress from "../shared/GenericProgress";
import ACShield from "./ACShield";

export default function ActorInfoHeader({
  actor,
  handleChange,
  xpProgress,
}: {
  actor: OSEActor;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  xpProgress: number;
}) {
  return (
    <Row $align="center" $gap="md" style={{ height: "70px" }}>
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
          flexGrow: 2,
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
        style={{
          flexGrow: 1,
          height: "100%",
          boxSizing: "border-box",
        }}
        $gap="xs"
        $align="start"
        $justify="center"
      >
        <Row>
          <TextSmall $color="label" style={{ width: 40 }}>
            HP:
          </TextSmall>
          <div style={{ width: 100 }}>
            <HitPoints />
          </div>
        </Row>
        <Row $align="center">
          <TextSmall $color="label" style={{ width: 40 }}>
            XP:
          </TextSmall>
          <div style={{ width: 100 }}>
            <GenericProgress max={100} value={xpProgress} />
          </div>
          <TextTiny>{xpProgress}%</TextTiny>
        </Row>
      </Column>
      <div>
        <ACShield width={55} />
      </div>
    </Row>
  );
}
