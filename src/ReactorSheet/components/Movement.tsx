import styled from "styled-components";
import { useReactorSheetContext } from "./context";
import { SectionHeader } from "./shared/elements";

const MovementWrapper = styled.div`
  margin: 8px 0;
  font-size: 0.75rem;

  label {
    color: var(--color-text-secondary);
  }
`;

export default function Movement() {
  const { actor } = useReactorSheetContext();
  console.log(actor);
  return (
    <MovementWrapper>
      <div className="flex-row justify-center align-center">
        <SectionHeader className="m-0">Movement:</SectionHeader>
        <div>
          <label>Exploration:</label> {actor.system.movement.base} ft.
        </div>
        <div>
          <label>Encounter:</label> {actor.system.movement.encounter} ft.
        </div>
        <div>
          <label>Overland:</label> {actor.system.movement.overland} miles/day
        </div>
      </div>
    </MovementWrapper>
  );
}
