import styled from "styled-components";
import { InlineInput } from "../InlineInput";
import { useReactorSheetContext } from "../context";
import { Column, Row, Text, TextSmall } from "../shared/elements";
import React from "react";
import ExperienceBar from "./ExperienceBar";
import Encumbrance from "../Encumbrance";
import HitPoints from "./HitPoints";

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr min-content 1fr;
  align-items: center;
  gap: 0.35rem 1rem;
  width: 100%;
  flex-grow: 3;
`;

const InfoGridItem = ({
  label,
  value,
  align = "center",
  labelWidth = 1,
  labelSize = "tiny",
  valueWidth = 1,
}: {
  label: string;
  value: string | number | React.ReactNode;
  align?: "start" | "center" | "end";
  valueWidth?: number;
  labelWidth?: number;
  labelSize?: "small" | "tiny" | "medium" | "large";
}) => (
  <>
    <Text
      $color="label"
      $size={labelSize}
      style={{
        gridColumnEnd: `span ${labelWidth}`,
        justifySelf: "start",
        alignSelf: "center",
        textTransform: "uppercase",
      }}
    >
      {label}
    </Text>
    <div style={{ gridColumnEnd: `span ${valueWidth}` }}>
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
    </div>
  </>
);

export default function ActorInfo() {
  const { actor, updateActor } = useReactorSheetContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateActor({ [name]: value });
  };

  return (
    <Column className="w-100">
      <div className="w-100">
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
          {actor.system.details.class + " " + actor.system.details.level}
        </Text>
      </div>
      <Row className="w-100">
        <Text $color="label">HP:</Text>
        <HitPoints />
      </Row>

      <Row className="w-100">
        <InfoGrid>
          <InfoGridItem
            label="XP:"
            labelWidth={1}
            valueWidth={3}
            value={<ExperienceBar actor={actor} />}
          />
          <InfoGridItem
            label="Encumbrance:"
            labelWidth={1}
            valueWidth={3}
            value={<Encumbrance />}
          />
          <InfoGridItem
            label="HD:"
            valueWidth={3}
            value={
              <div style={{ alignSelf: "center" }}>
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
              </div>
            }
          />
          <InfoGridItem
            label={"Alignment:"}
            valueWidth={3}
            value={actor.system.details.alignment || "Unaligned"}
          />
        </InfoGrid>
      </Row>
    </Column>
  );
}
