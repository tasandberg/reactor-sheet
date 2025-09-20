import styled from "styled-components";
import ActorScores from "../../ActorScores";
import { Column } from "../../shared/elements";
import SavingThrows from "../SavingThrows";
import PreparedSpells from "../Spells/PreparedSpells";
import Exploration from "./Exploration";
import Weapons from "./Weapons";
/**
 * TODO:
 * - reference: https://www.dndbeyond.com/characters/91477249
 * - Implement table headers and rows using a grid layout
 *
 */

const ScoreBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin: 0 auto;
  gap: 1rem;
  max-width: 550px;
`;

const ActionsContainer = styled(Column)`
  max-width: 550px;
  margin: 0 auto;
  width: 100%;
`;

export default function Actions() {
  return (
    <Column $align="start" style={{ position: "relative" }}>
      <ScoreBoxContainer>
        <ActorScores />
      </ScoreBoxContainer>
      <ActionsContainer>
        <Weapons />
        <PreparedSpells />
        <Exploration />
        <SavingThrows />
      </ActionsContainer>
    </Column>
  );
}
