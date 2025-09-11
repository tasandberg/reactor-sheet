import styled from "styled-components";
import { useReactorSheetContext } from "./context";
import { SectionHeader } from "./shared/elements";

const EncumbranceWrapper = styled.div`
  margin: 8px 0;
  font-size: 0.75rem;
  width: 100%;

  label {
    color: var(--color-text-secondary);
    text-wrap: nowrap;
    width: 150px;
  }
`;

const EncumbranceProgressBar = styled.progress`
  width: 100%;
  height: 20px;
  position: relative;
`;

export default function Encumbrance() {
  const { actorData } = useReactorSheetContext();
  const { encumbrance } = actorData;

  return encumbrance.enabled ? (
    <EncumbranceWrapper>
      <SectionHeader className="m-0" $fw="normal">
        Encumbrance:
      </SectionHeader>
      <div className="flex-row justify-start align-center">
        <EncumbranceProgressBar
          value={encumbrance.value}
          max={encumbrance.max}
        />
        {encumbrance.value} / {encumbrance.max}
      </div>
    </EncumbranceWrapper>
  ) : null;
}
