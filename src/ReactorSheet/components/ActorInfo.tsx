import styled from "styled-components";
import ArmorClass from "./ArmorClass";
import HitPoints from "./HitPoints";
import { InlineInput } from "./InlineInput";
import { useReactorSheetContext } from "./context";

const PropertiesGrid = styled.div`
  display: grid;
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

export default function ActorInfo() {
  const { actor, updateActor } = useReactorSheetContext();
  const { title, alignment, class: cls, level, xp } = actor.system.details;
  const mvmt = actor.system.movement;
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateActor({ [name]: value });
  };

  return (
    <div className="actor-info mb-4 flex-row text-emphatic gap-0">
      <div className="flex-col gap-1">
        <h1 className="m-0">
          <InlineInput
            type="text"
            name="name"
            defaultValue={actor.name}
            onBlur={handleChange}
          />
        </h1>
        <div>
          <i>
            <InlineInput
              type="text"
              name="system.details.title"
              defaultValue={title}
              onBlur={handleChange}
            />
          </i>
        </div>
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
            <span
              data-tooltip={`Encounter movement ${mvmt.encounter} ft. / turn`}
            >
              {mvmt.encounter}
            </span>{" "}
            /{" "}
            <span
              data-tooltip={`Overland movement ${mvmt.overland} miles / day`}
            >
              {mvmt.overland}
            </span>
          </div>
        </PropertiesGrid>
      </div>
      <div className="flex-col" style={{ minWidth: "170px" }}>
        <div className="flex-row">
          <HitPoints />
          <ArmorClass />
        </div>
        <div className="flex-row">
          <a
            className="button inline-roll roll w-100"
            data-mode="roll"
            data-formula="1d3"
            data-flavor="Long Rest HP recovery"
            title="Long rest is a full 24-hour rest, restoring 1d3 hit points."
            data-tooltip="Long rest is a full 24-hour rest, restoring 1d3 hit points."
          >
            <i className="fa-solid fa-campground mr-1"></i>Rest
          </a>
          <a
            className="button inline-roll w-100"
            title="Short Rest"
            data-tooltip="Re-memorize all spells (not implemented)"
            onClick={() => alert("Not implemented")}
          >
            <i className="fa-solid fa-book mr-1"></i>Study
          </a>
        </div>
      </div>
    </div>
  );
}
