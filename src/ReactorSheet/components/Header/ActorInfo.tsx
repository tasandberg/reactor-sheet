import styled from "styled-components";
import ArmorClass from "../ArmorClass";
import { InlineInput } from "../InlineInput";
import { useReactorSheetContext } from "../context";
import { Flex, Row, Text, TextSmall } from "../shared/elements";
import React from "react";
import ExperienceBar from "./ExperienceBar";
import HitPoints from "../Info/HitPoints";

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: min-content max-content min-content max-content;);
  gap: 0.5rem 1rem;
`;

const InfoGridItem = ({
  label,
  value,
  align = "center",
}: {
  label: string;
  value: string | number | React.ReactNode;
  align?: "start" | "center" | "end";
}) => (
  <>
    <Text
      $color="secondary"
      $size="small"
      style={{
        justifySelf: "start",
        alignSelf: align,
        width: "100%",
      }}
    >
      {label}
    </Text>
    {React.isValidElement(value) ? (
      value
    ) : (
      <TextSmall
        style={{
          justifySelf: "start",
          alignSelf: align,
        }}
      >
        {value}
      </TextSmall>
    )}
  </>
);

export default function ActorInfo() {
  const { actor, updateActor } = useReactorSheetContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateActor({ [name]: value });
  };

  return (
    <div className="actor-info mb-4 flex-row text-emphatic gap-0">
      <div className="flex-col gap-3">
        <div className="flex-col gap-0">
          <h1 className="m-0">
            <InlineInput
              type="text"
              name="name"
              placeholder="Character Name"
              defaultValue={actor.name}
              onBlur={handleChange}
            />
          </h1>
          <Text $color="secondary">
            {actor.system.details.class} {actor.system.details.level}
          </Text>
        </div>
        <div className="flex-col gap-0">
          <InfoGrid>
            <InfoGridItem
              label="Hit Points:"
              value={
                <Row style={{ gridColumnEnd: "span 3" }}>
                  <HitPoints />
                </Row>
              }
            />
            <InfoGridItem label="XP:" value={<ExperienceBar actor={actor} />} />
            <InfoGridItem
              label="Alignment:"
              value={actor.system.details.alignment}
            />
            <InfoGridItem
              label="Hit Die:"
              value={
                <a
                  className="inline-roll roll"
                  data-mode="roll"
                  data-formula="1d4"
                  data-tooltip-text="1d4"
                  data-flavor={`Hit Die`}
                >
                  <i className="fa-solid fa-dice-d20" />
                  {actor.system.hp.hd}
                </a>
              }
            />
            <InfoGridItem
              label="Movement:"
              value={
                <Flex
                  $align="center"
                  $justify="center"
                  style={{
                    gridColumnEnd: "span 4",
                    gap: "0 0.8rem",
                    padding: "0.2rem 0.5rem",
                    backgroundColor: "#222",
                    margin: "0 16px",
                    flexWrap: "wrap",
                    border: "1px solid var(--color-text-secondary)",
                  }}
                >
                  <TextSmall>
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Base:
                    </span>{" "}
                    {actor.system.movement.base} ft.
                  </TextSmall>
                  <TextSmall>
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Encounter:
                    </span>{" "}
                    {actor.system.movement.encounter} ft.
                  </TextSmall>
                  <TextSmall>
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      Overland:
                    </span>{" "}
                    {actor.system.movement.overland} miles
                  </TextSmall>
                </Flex>
              }
            />
          </InfoGrid>
        </div>
      </div>
      <ArmorClass />
    </div>
  );
}
