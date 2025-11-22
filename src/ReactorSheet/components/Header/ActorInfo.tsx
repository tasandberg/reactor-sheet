import { useReactorSheetContext } from "../context";
import { Column, Row } from "../shared/elements";
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
import { diceIcon } from "../shared/elements-vars";
import Money from "../shared/Money";
import Movement from "../Footer/Movement";
import Encumbrance from "./Encumbrance";
import HeaderSection from "./HeaderSection";

const DetailBox = styled(Column)<{ $grow?: number }>`
  justify-content: start;
  align-items: start;
  height: 100%;
  border-radius: 4px;
  gap: 2px;
`;

export default function ActorInfo() {
  const { actor, updateActor, oseMode } = useReactorSheetContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    const parsedValue = type === "number" ? Number(value) : value;
    updateActor({ [name]: parsedValue });
  };

  const nextLevel = getNextLevelXp(
    actor.system.details.class,
    Number(actor.system.details.level)
  );
  console.log("class", actor);

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
    <Column $gap="md" $align="start" className="p-3 pt-1">
      <ActorInfoHeader
        actor={actor}
        handleChange={handleChange}
        xpProgress={xpProgress}
      />
      {/* Below the fold */}
      <HeaderSection label="Character Details">
        <DetailBox style={{ width: "calc(33% - 4px)" }}>
          <CharacterInput
            label="Class"
            name="system.details.class"
            defaultValue={actor.system.details.class}
            style={{ textAlign: "right" }}
            onBlur={handleChange}
          />

          <CharacterInput
            label="Alignment"
            name="system.details.alignment"
            defaultValue={actor.system.details.alignment}
            style={{ textAlign: "right" }}
            onBlur={handleChange}
          />
          {oseMode.advanced && (
            <CharacterInput
              label="Race"
              name={`flags.${APP_ID}.race`}
              defaultValue={actor.flags[APP_ID]?.race || ""}
              style={{ textAlign: "right" }}
              onBlur={handleChange}
            />
          )}
          <CharacterInput
            label="Title"
            name="system.details.title"
            defaultValue={actor.system.details.title}
            style={{ textAlign: "right" }}
            onBlur={handleChange}
          />
        </DetailBox>
        <DetailBox
          style={{
            width: "calc(33% - 4px)",
            height: "100%",
          }}
        >
          <CharacterInput
            label="Level"
            name="system.details.level"
            type="number"
            defaultValue={actor.system.details.level}
            style={{ textAlign: "right" }}
            onBlur={handleChange}
          />
          <CharacterInput
            label="Experience"
            name="system.details.xp.value"
            type="number"
            defaultValue={Number(actor.system.details.xp.value)}
            style={{ textAlign: "right" }}
            onBlur={handleChange}
          />
          <CharacterInput
            label="Next Level"
            name="system.details.xp.next"
            defaultValue={nextLevel}
            style={{ textAlign: "right" }}
            disabled
          />
          <CharacterInput
            label="Hit Dice"
            name="system.details.hitDice"
            renderInput={
              <div className="w-100">
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
              </div>
            }
          />
        </DetailBox>
        <DetailBox style={{ width: "calc(33% - 4px)" }}>
          <CharacterInput
            label="Current HP"
            name="system.hp.value"
            defaultValue={actor.system.hp.value}
            style={{ textAlign: "right" }}
            onBlur={handleChange}
          />
          <CharacterInput
            label="Max HP"
            name="system.hp.max"
            defaultValue={actor.system.hp.max}
            style={{ textAlign: "right" }}
            onBlur={handleChange}
          />
        </DetailBox>
      </HeaderSection>
      <Money />
      <Row>
        <Movement />
        <Encumbrance />
      </Row>
      {/* <CharacterDetails
        actor={actor}
        handleChange={handleChange}
        oseMode={oseMode}
      /> */}
    </Column>
  );
}
