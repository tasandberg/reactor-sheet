import { InlineInput } from "../InlineInput";
import { useReactorSheetContext } from "../context";
import { Column, Row, Text, TextSmall } from "../shared/elements";
import React from "react";
import HitPoints from "./HitPoints";
import { diceIcon, spacer, fontSizes } from "../shared/elements-vars";
import GenericProgress from "../shared/GenericProgress";
import { APP_ID } from "@src/constants";

function ActorInfoField({
  label,
  value,
  name,
  update,
  inputSize,
}: {
  label: string;
  value: string | number;
  name: string;
  update?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputSize?: number;
}) {
  return (
    <Row style={{ width: "auto" }}>
      <TextSmall $color="label">{label}</TextSmall>
      {update ? (
        <TextSmall>
          <InlineInput
            type={typeof value === "number" ? "number" : "text"}
            style={{
              width: inputSize || 60,
              height: "20px",
              paddingLeft: spacer.xs,
            }}
            name={name}
            value={value}
            onChange={update}
          />
        </TextSmall>
      ) : (
        <TextSmall className="pl-1">{value}</TextSmall>
      )}
    </Row>
  );
}

export default function ActorInfo() {
  const { actor, actorData, updateActor } = useReactorSheetContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateActor({ [name]: value });
  };

  return (
    <Column className="w-100" $gap="sm">
      <Column $gap="sm" $align="start">
        <h1 className="m-0">
          <InlineInput
            type="text"
            name="name"
            placeholder="Character Name"
            defaultValue={actor.name}
            style={{ paddingLeft: 0 }}
            onBlur={handleChange}
          />
        </h1>
        <Text $color="secondary">
          {actor.system.details.class + " " + actor.system.details.level}
        </Text>
        <Row>
          <TextSmall $color="label">HP:</TextSmall>
          <HitPoints />
        </Row>
        <Row
          $wrap
          $align="center"
          $justify="start"
          $gap="sm"
          style={{ rowGap: spacer.sm }}
        >
          <ActorInfoField
            label="Race:"
            name={`flags.${APP_ID}.race`}
            value={actor.flags[APP_ID]?.race || ""}
            update={handleChange}
            inputSize={80}
          />
          <ActorInfoField
            label="Class:"
            name="system.details.class"
            value={actorData.details.class}
            update={handleChange}
            inputSize={80}
          />
          <ActorInfoField
            label="Level:"
            name="system.details.level"
            value={actorData.details.level}
            update={handleChange}
          />
          <ActorInfoField
            label="XP:"
            name="system.details.xp.value"
            value={actorData.details.xp.value}
            update={handleChange}
          />
          <ActorInfoField
            label="Next Level:"
            name="system.details.xp.next"
            value={actorData.details.xp.next}
            update={handleChange}
          />
          <Row style={{ width: "auto" }}>
            <TextSmall $color="label">Hit Dice:</TextSmall>
            <a
              className="inline-roll roll text-sm"
              data-mode="roll"
              data-formula="1d4"
              data-tooltip-text="Hit Dice 1d4"
              data-flavor={`Hit Die`}
            >
              <i className={diceIcon.d4} />
              {actor.system.hp.hd}
            </a>
          </Row>
        </Row>
        <Row $wrap $align="center" $justify="start" $gap="md">
          <ActorInfoField
            label={"Alignment:"}
            name="system.details.alignment"
            value={actorData.details.alignment}
            update={handleChange}
          />
          <ActorInfoField
            label={"Title:"}
            name="system.details.title"
            value={actorData.details.title}
            inputSize={100}
            update={handleChange}
          />
        </Row>
        <Row>
          <TextSmall $color="label">Enc:</TextSmall>
          <GenericProgress
            max={20}
            styles={{ width: "150px" }}
            value={Math.ceil(
              (actorData.encumbrance.value / actorData.encumbrance.max) * 20
            )}
          />
          <TextSmall>
            {actorData.encumbrance.value}/{actorData.encumbrance.max}gp
          </TextSmall>
        </Row>
      </Column>
    </Column>
  );
}
