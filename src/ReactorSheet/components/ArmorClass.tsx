import styled from "styled-components";
import { useReactorSheetContext } from "./context";

const ArmorClassWrapper = styled.div<{ $percentage?: number }>`
  padding: 0.25rem;
  position: relative;
  text-align: center;
  flex-direction: column;
  width: 80px;
  height: fit-content;
  background-position: center;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.8);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: midnightblue;
    opacity: 0.75;
    z-index: -1;
  }
`;

const ArmorClassLabel = styled.h5`
  margin: 0;
  flex-grow: 0;
  font-family: var(--font-h1);
`;

const ArmorClassValue = styled.div`
  margin: 0;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;

  & > input {
    width: 100%;
    font-weight: bold;
    text-shadow: 0px 0px 5px #000;
  }
`;

const ArmorClassInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  text-align: center;
  color: var(--color-text-emphasis);

  &:focus {
    color: var(--color-text-emphasis);
  }
`;

const ArmorClassMax = styled.div`
  flex-grow: 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  font-size: 0.85rem;

  & > input {
    height: 20px;
    margin-top: -5px;
    width: 30px;
  }
`;

// Hit Points component for displaying an actor's current hit points

export default function ArmorClass() {
  const { actorData } = useReactorSheetContext();
  return (
    <ArmorClassWrapper className="p-4">
      <ArmorClassLabel>AC</ArmorClassLabel>
      <ArmorClassValue>
        <ArmorClassInput type="number" readOnly value={actorData.aac.value} />
      </ArmorClassValue>
      <ArmorClassMax>
        <label className="text-secondary">Base:</label>
        <ArmorClassInput type="number" readOnly value={actorData.aac.naked} />
      </ArmorClassMax>
    </ArmorClassWrapper>
  );
}
