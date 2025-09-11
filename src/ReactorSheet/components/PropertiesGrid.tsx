import styled from "styled-components";
import { useReactorSheetContext } from "./context";
const PropertiesGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  grid-template-columns: repeat(2, max-content);
  width: fit-content;
  color: var(--color-text-emphasis);
  & > div {
    padding: 3px 3px;
  }

  label {
    color: var(--color-text-secondary);
    margin-right: 4px;
  }
  span {
    font-family: var(--font-body);
    &:hover {
      background-color: black;
      text-shadow: #fff 0 0 3px;
    }
  }
`;

export default function Properties() {
  const { actor } = useReactorSheetContext();
  const { alignment, class: cls, level, xp } = actor.system.details;
  const mvmt = actor.system.movement;
  return (
    <PropertiesGrid>
      <div>
        <label>Level:</label> {level}
      </div>
      <div>
        <label>Class:</label> {cls}
      </div>
      <div>
        <label>XP:</label> {xp.value} / {xp.next}
      </div>
      <div>
        <label>Alignment:</label> {alignment}
      </div>
      <div>
        <label>HD:</label>
        <a
          className="inline-roll roll"
          data-mode="roll"
          data-formula="1d4"
          data-tooltip-text="1d4"
          data-flavor={`Hit Die`}
        >
          <i className="fa-solid fa-dice-d20" />
          {actor.system.hp.hd}
        </a>
      </div>
      <div>
        <label>Movement:</label>
        <span data-tooltip={`Base movement ${mvmt.base} ft. / turn`}>
          {mvmt.base}
        </span>{" "}
        /{" "}
        <span data-tooltip={`Encounter movement ${mvmt.encounter} ft. / turn`}>
          {mvmt.encounter}
        </span>{" "}
        /{" "}
        <span data-tooltip={`Overland movement ${mvmt.overland} miles / day`}>
          {mvmt.overland}
        </span>
      </div>
    </PropertiesGrid>
  );
}
