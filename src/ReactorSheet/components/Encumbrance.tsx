import styled from "styled-components";
import { useReactorSheetContext } from "./context";
import { SectionHeader } from "./shared/elements";

const EncumbranceWrapper = styled.div`
  margin: 8px 0;
  font-size: 0.75rem;

  label {
    color: var(--color-text-secondary);
  }
`;

const EncumbranceProgressBar = styled.progress`
  width: 100px;
  height: 20px;
  margin-left: 8px;
  position: relative;
`;

export default function Encumbrance() {
  const { actor } = useReactorSheetContext();
  const { encumbrance } = actor.system;

  return encumbrance.enabled ? (
    <EncumbranceWrapper>
      <div className="flex-row justify-start align-center">
        <SectionHeader className="m-0" $fw="normal">
          Encumbrance:
        </SectionHeader>
        <EncumbranceProgressBar value={encumbrance.value} max={encumbrance.max}>
          <h1>wow</h1>
        </EncumbranceProgressBar>
        {encumbrance.value} / {encumbrance.max}
      </div>
    </EncumbranceWrapper>
  ) : null;
}
