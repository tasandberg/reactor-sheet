import styled from "styled-components";
import { useReactorSheetContext } from "./context";

const EncumbranceWrapper = styled.div`
  margin: 8px 0;
  font-size: 0.75rem;
  min-width: 250px;

  label {
    color: var(--color-text-secondary);
    text-wrap: nowrap;
    width: 150px;
  }
`;

const EncumbranceProgressBar = styled.progress`
  width: 100%;
  height: 30px;
`;

const EncumbranceProgressBarWrapper = styled.div`
  position: relative;
  width: 250px;
  display: flex;
  align-items: center;
  justify-content: center;

  & > label {
    position: absolute;
    left: 5px;
    color: var(--color-text-emphasis);
    font-size: 0.65rem;
  }

  & > span {
    position: absolute;
    font-size: 0.5rem;
    top: 21px;
    color: var(--color-text-emphasis);
  }

  & > span:nth-of-type(1) {
    left: 25%;
  }

  & > span:nth-of-type(2) {
    left: 37.5%;
  }

  & > span:nth-of-type(3) {
    left: 50%;
  }
`;

export default function Encumbrance() {
  const { actorData } = useReactorSheetContext();
  const { encumbrance } = actorData;

  return encumbrance.enabled ? (
    <EncumbranceWrapper>
      <label>Encumbrance</label>
      <EncumbranceProgressBarWrapper>
        <EncumbranceProgressBar
          value={encumbrance.value}
          max={encumbrance.max}
        />
        <label>
          {encumbrance.value} / {encumbrance.max}
        </label>
        <span>▲</span>
        <span>▲</span>
        <span>▲</span>
      </EncumbranceProgressBarWrapper>
    </EncumbranceWrapper>
  ) : null;
}
