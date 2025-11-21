import { useReactorSheetContext } from "../context";
import { Column, Row, TextSmall } from "../shared/elements";
import React from "react";
import {
  getHitDice,
  getNextLevelXp,
  getPreviousLevelXp,
} from "@src/lib/class-data";
import ActorInfoHeader from "./ActorInfoHeader";
import CharacterInput from "./CharacterInput";
import styled from "styled-components";
import { APP_ID } from "@src/constants";
import { colors, diceIcon } from "../shared/elements-vars";
import GenericProgress from "../shared/GenericProgress";

const DetailBox = styled(Column)<{ $grow?: number }>`
  justify-content: start;
  align-items: start;
  height: 100%;
  gap: 2px;
`;

export default function ActorInfo() {
  const { actor, updateActor, oseMode } = useReactorSheetContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateActor({ [name]: value });
  };

  const nextLevel = getNextLevelXp(
    actor.system.details.class,
    Number(actor.system.details.level)
  );

  const previousLevel = getPreviousLevelXp(
    actor.system.details.class,
    Number(actor.system.details.level)
  );

  const xpProgress = Math.clamp(
    Math.floor(
      ((actor.system.details.xp.value - previousLevel) /
        (nextLevel - previousLevel)) *
        100
    ),
    0,
    100
  );

  const hitDice = getHitDice(
    actor.system.details.class,
    Number(actor.system.details.level)
  );

  return (
    <Column $gap="md" className="p-3 pt-1">
      <ActorInfoHeader
        actor={actor}
        handleChange={handleChange}
        xpProgress={xpProgress}
      />
      {/* Below the fold */}
      <Row $gap="xs" $justify="space-between" style={{ height: 200 }}>
        <DetailBox style={{ width: 200 }}>
          <CharacterInput
            label="Class"
            name="system.details.class"
            defaultValue={actor.system.details.class}
            onBlur={handleChange}
          />

          <CharacterInput
            label="Alignment"
            name="system.details.alignment"
            defaultValue={actor.system.details.alignment}
            onBlur={handleChange}
          />
          {oseMode.advanced && (
            <CharacterInput
              label="Race"
              name={`flags.${APP_ID}.race`}
              value={actor.flags[APP_ID]?.race || ""}
              onBlur={handleChange}
            />
          )}
          <CharacterInput
            label="Title"
            name="system.details.title"
            defaultValue={actor.system.details.title}
            onBlur={handleChange}
          />
          <CharacterInput
            label="Hit Dice"
            name="system.details.hitDice"
            renderInput={
              <a
                className="inline-roll roll text-sm"
                data-mode="roll"
                data-formula={hitDice}
                data-tooltip-text={`Hit Dice ${hitDice}`}
                data-flavor={`Hit Die`}
              >
                <i className={diceIcon[hitDice.slice(1, 3)]} />
                {hitDice}
              </a>
            }
          />
        </DetailBox>
        <DetailBox style={{ width: 200 }}>
          <Column
            style={{
              padding: 6,
              marginTop: 6,
              backgroundColor: colors.bgDark3,
              borderRadius: 4,
            }}
          >
            <Row>
              <TextSmall $color="hint">Level</TextSmall>
              <TextSmall style={{ marginLeft: "auto" }}>
                {actor.system.details.level}
              </TextSmall>
            </Row>
            <GenericProgress
              max={100}
              value={xpProgress}
              fg={colors.secondary}
              bg={colors.bgDark5}
            />
            <Row>
              <TextSmall $color="hint">Experience</TextSmall>
              <TextSmall style={{ marginLeft: "auto" }}>
                {actor.system.details.xp.value}
              </TextSmall>
            </Row>
            <Row>
              <TextSmall $color="hint">Next Level</TextSmall>
              <TextSmall style={{ marginLeft: "auto" }}>{nextLevel}</TextSmall>
            </Row>
          </Column>
        </DetailBox>
      </Row>
      {/* <CharacterDetails
        actor={actor}
        handleChange={handleChange}
        oseMode={oseMode}
      /> */}
    </Column>
  );
}
