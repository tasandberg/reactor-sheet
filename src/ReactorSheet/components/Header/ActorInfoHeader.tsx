import type { OSEActor } from "@src/ReactorSheet/types/types";
import { InlineInput } from "../InlineInput";
import { Column, Row, Text, TextSmall, TextTiny } from "../shared/elements";
import ActorImage from "./ActorImage";
import ActorInfoHeaderHP from "./ActorInfoHeaderHP";
import ActorInfoHeaderAC from "./ActorInfoHeaderAC";
import styled from "styled-components";

const InfoRightSection = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
  height: 70px;
  align-items: center;
  justify-content: center;
  padding: 4px 4px;

  & > div {
    border-radius: 5px;
    padding: 2px 8px;
    height: 100%;
  }
`;

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
        $gap="xs"
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
        <TextSmall $color="label" style={{ marginTop: -6 }}>
          {`Level ${actor.system.details.level} ${actor.system.details.class}`}
        </TextSmall>
        <Row $gap="xs" $align="center">
          <progress
            max={100}
            value={xpProgress}
            style={{ padding: 0, margin: 0, width: 80 }}
          />
          <TextTiny $color="hint">
            Level {Number(actor.system.details.level) + 1}
          </TextTiny>
        </Row>
      </Column>
      <InfoRightSection>
        <div>
          <ActorInfoHeaderHP />
        </div>
        <ActorInfoHeaderAC />
      </InfoRightSection>
    </Row>
  );
}
