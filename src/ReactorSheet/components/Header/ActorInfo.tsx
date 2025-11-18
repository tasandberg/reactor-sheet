import styled from "styled-components";
import { InlineInput } from "../InlineInput";
import { useReactorSheetContext } from "../context";
import { Column, Row, Text, TextSmall } from "../shared/elements";
import React from "react";
import ExperienceBar from "./ExperienceBar";
import Encumbrance from "./Encumbrance";
import HitPoints from "./HitPoints";
import { diceIcon, fontSizes } from "../shared/elements-vars";
import clsx from "clsx";

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
  labelSize = "sm",
  valueWidth = 1,
}: {
  label: string;
  value: string | number | React.ReactNode;
  align?: "start" | "center" | "end";
  valueWidth?: number;
  labelWidth?: number;
  labelSize?: keyof typeof fontSizes;
}) => (
  <>
    <Text
      $color="label"
      $size={labelSize}
      style={{
        gridColumnEnd: `span ${labelWidth}`,
        justifySelf: "start",
        alignSelf: "center",
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

export default function ActorInfo({ collapsed }: { collapsed: boolean }) {
  const { actor, updateActor } = useReactorSheetContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateActor({ [name]: value });
  };

  return (
    <Column
      className="w-100"
      $gap={collapsed ? "xs" : "md"}
      style={{
        flexDirection: collapsed ? "row" : "column",
        alignItems: collapsed ? "center" : "flex-start",
      }}
    >
      <div style={{ display: "flex", flexGrow: 0, flexDirection: "column" }}>
        <h1
          className={clsx("m-0", { "text-lg": collapsed })}
          style={{ transition: "font-size 0.2s linear", lineHeight: 1 }}
        >
          <InlineInput
            type="text"
            name="name"
            placeholder="Character Name"
            defaultValue={actor.name}
            onBlur={handleChange}
          />
        </h1>
        <Text
          $color="label"
          $size={collapsed ? "sm" : "md"}
          style={{ marginTop: -4 }}
        >
          {"Level " +
            actor.system.details.level +
            " " +
            actor.system.details.class}
        </Text>
      </div>
      <Row className="w-100" style={{ flexGrow: 1 }}>
        <TextSmall $color="label">HP:</TextSmall>
        <HitPoints />
      </Row>
      {!collapsed && (
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
              valueWidth={1}
              value={
                <div style={{ alignSelf: "center" }}>
                  <a
                    className="inline-roll roll"
                    data-mode="roll"
                    data-formula="1d4"
                    data-tooltip-text="1d4"
                    data-flavor={`Hit Die`}
                  >
                    <i className={diceIcon.d4} />
                    {actor.system.hp.hd}
                  </a>
                </div>
              }
            />
            <InfoGridItem
              label={"Alignment:"}
              valueWidth={1}
              value={actor.system.details.alignment || "Unaligned"}
            />
          </InfoGrid>
        </Row>
      )}
    </Column>
  );
}
