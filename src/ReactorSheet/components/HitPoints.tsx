import styled from "styled-components";
import { useReactorSheetContext } from "./context";
import { useEffect, useState, type SyntheticEvent } from "react";

const HitPointsWrapper = styled.div<{ $percentage?: number }>`
  padding: 0.25rem;
  position: relative;
  text-align: center;
  flex-direction: column;
  width: 80px;
  height: fit-content;
  background: linear-gradient(
    to bottom,
    black 0%,
    maroon ${(props) => 100 - props.$percentage}%,
    darkred 100%
  );
  border: 1px solid var(--color-text-secondary);
  border-radius: 4px;
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
  color: var(--color-text-emphasis);

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
  const [currentHp, setCurrentHp] = useState(actor.system.hp.value);

  const onChangeHp = async (e: SyntheticEvent) => {
    const field = (e.target as HTMLInputElement).name;
    const value = Number((e.target as HTMLInputElement).value);
    let newHp = value;
    if (field === "system.hp.value") {
      newHp = Math.clamp(newHp, 0, actor.system.hp.max);
    }
    if (newHp === actor.system.hp.value) {
      setCurrentHp(newHp);
      return;
    }
    await updateActor({ [field]: newHp });
  };

  useEffect(() => setCurrentHp(actor.system.hp.value), [actor.system.hp.value]);

  return (
    <HitPointsWrapper
      className="p-4"
      $percentage={(actor.system.hp.value / actor.system.hp.max) * 100}
    >
      <HitPointsLabel>Hit Points</HitPointsLabel>
      <HitPointsValue>
        <HitPointsInput
          type="number"
          max={actor.system.hp.max}
          min="0"
          value={currentHp}
          name="system.hp.value"
          onBlur={onChangeHp}
          onChange={(e) => setCurrentHp(e.target.valueAsNumber)}
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
