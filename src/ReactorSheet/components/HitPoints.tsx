import styled from "styled-components";
import { useReactorSheetContext } from "./context";
import { type SyntheticEvent } from "react";

const HitPointsWrapper = styled.div<{ $percentage?: number }>`
  padding: 0.25rem;
  position: relative;
  text-align: center;
  flex-direction: column;
  width: 80px;
  height: fit-content;
  background-color: transparent;
  background-position: center;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%);

  &::before {
    content: "";
    position: absolute;
    top: ${(props) => (props.$percentage ? 100 - props.$percentage : 100)}%;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: crimson;
    opacity: 0.75;
    z-index: -1;
  }
`;

const HitPointsLabel = styled.h5`
  margin: 0;
  flex-grow: 0;
  font-family: var(--font-h1);
`;

const HitPointsValue = styled.div`
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

const HitPointsInput = styled.input`
  border: none;
  background: transparent;
  width: 100%;
  text-align: center;

  &:focus {
    color: var(--color-text-emphasis);
  }
`;

const HitPointsMax = styled.div`
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

export default function HitPoints() {
  const { actor, updateActor } = useReactorSheetContext();
  const onChangeHp = (e: SyntheticEvent) => {
    const field = (e.target as HTMLInputElement).name;
    const value = Number((e.target as HTMLInputElement).value);
    console.log("Updating HP:", field, value);
    let newHp = value;
    if (field === "system.hp.value") {
      newHp = Math.clamp(newHp, 0, actor.system.hp.max);
    }
    updateActor({ "system.hp.value": newHp });
  };

  return (
    <HitPointsWrapper
      className="p-4"
      $percentage={(actor.system.hp.value / actor.system.hp.max) * 100}
    >
      <HitPointsLabel>Hit points</HitPointsLabel>
      <HitPointsValue>
        <HitPointsInput
          type="number"
          max={actor.system.hp.max}
          defaultValue={actor.system.hp.value}
          name="system.hp.value"
          onBlur={onChangeHp}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </HitPointsValue>
      <HitPointsMax>
        <label className="text-secondary">Max:</label>
        <HitPointsInput
          type="number"
          name="system.hp.max"
          defaultValue={actor.system.hp.max}
          onBlur={onChangeHp}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </HitPointsMax>
    </HitPointsWrapper>
  );
}
