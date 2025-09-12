import styled from "styled-components";
import { useReactorSheetContext } from "./context";

const ArmorClassWrapper = styled.div<{ $percentage?: number }>`
  padding: 0.25rem;
  position: relative;
  text-align: center;
  flex-direction: column;
  width: 80px;
  height: fit-content;
  border: 1px solid var(--color-text-secondary);
  background: #222;
  border-radius: 4px;
`;

const ArmorClassLabel = styled.div`
  margin: 0;
  flex-grow: 0;
`;

const ArmorClassValue = styled.div`
  margin: 0;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;

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
        <ArmorClassInput
          type="number"
          readOnly
          disabled
          value={actorData.aac.value}
        />
      </ArmorClassValue>
      <ArmorClassMax>
        <label className="text-secondary">Base:</label>
        <ArmorClassInput
          type="number"
          disabled
          readOnly
          value={actorData.aac.naked}
        />
      </ArmorClassMax>
    </ArmorClassWrapper>
  );
}
