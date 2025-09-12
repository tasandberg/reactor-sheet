import styled from "styled-components";
import { useEffect, useState, type SyntheticEvent } from "react";
import { useReactorSheetContext } from "../context";
import { SectionHeader } from "../shared/elements";
import { InlineInput } from "../InlineInput";

const HitPointsBar = styled.div<{ $percentage: number }>`
  width: 100%;
  height: 30px;
  border: 2px solid var(--color-border);
  position: relative;
  border-radius: 4px;
  box-shadow: inset 0 0 7px #000000;
  border: 1px solid var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 0 4px;

  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: ${(props) => props.$percentage - 100}%;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to right, black -50%, green 100%);
    pointer-events: none;
    transition: left 0.3s ease-in-out;
  }

  span {
    position: relative;
    z-index: 1;
    color: var(--color-text-emphasis);
  }
`;

const IncrementButton = styled.button`
  min-width: 20px;
  min-height: 20px;
  flex-grow: 0;
  flex-shrink: 0;
  font-size: 0.75rem;
  padding: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export default function HitPoints() {
  const { actor, updateActor } = useReactorSheetContext();
  const [currentHp, setCurrentHp] = useState(actor.system.hp.value);
  const [isEditing, setIsEditing] = useState(false);

  const onChangeHp = async (e: SyntheticEvent) => {
    const field = (e.target as HTMLInputElement).name;
    const value = Number((e.target as HTMLInputElement).value);

    let newHp = value;
    if (field === "system.hp.max") {
      newHp = Math.clamp(newHp, 0, Infinity);
      if (currentHp > newHp) {
        setCurrentHp(newHp);
      }
    }

    if (field === "system.hp.value") {
      newHp = clampHp(value);
    }
    if (newHp === actor.system.hp.value) {
      setCurrentHp(newHp);
      return;
    }
    await updateActor({ [field]: newHp });
    ui.notifications.info(`Hit Points updated to ${newHp}`);
    setIsEditing(false);
  };

  const clampHp = (hp: number) => {
    return Math.clamp(hp, 0, actor.system.hp.max);
  };

  useEffect(() => setCurrentHp(actor.system.hp.value), [actor.system.hp.value]);

  return (
    <div>
      <div className="flex-col gap-1">
        <div className="flex-row justify-between align-center">
          <SectionHeader className="m-0 align-center flex-row gap-1">
            Hit Points
          </SectionHeader>
        </div>

        {isEditing ? (
          <div className="flex-row align-center gap-2">
            Current:
            <input
              id="hp-current"
              defaultValue={currentHp}
              style={{
                height: "30px",
                width: "100%",
                textAlign: "center",
              }}
              onBlur={onChangeHp}
              name="system.hp.value"
            />
            Max:
            <input
              id="hp-max"
              defaultValue={actor.system.hp.max}
              style={{
                height: "30px",
                width: "100%",
                textAlign: "center",
              }}
              onBlur={onChangeHp}
              name="system.hp.max"
            />
          </div>
        ) : (
          <div className="flex-row align-center gap-1">
            <IncrementButton
              onClick={async () =>
                await updateActor({ "system.hp.value": clampHp(currentHp - 1) })
              }
            >
              <i className="fas fa-minus" />
            </IncrementButton>
            <HitPointsBar
              $percentage={(currentHp / actor.system.hp.max) * 100}
              onClick={() => setIsEditing(true)}
              className="cursor-pointer"
            >
              <span>
                {currentHp} / {actor.system.hp.max}
              </span>
            </HitPointsBar>
            <IncrementButton
              onClick={async () =>
                await updateActor({ "system.hp.value": clampHp(currentHp + 1) })
              }
            >
              <i className="fas fa-plus" />
            </IncrementButton>
          </div>
        )}
      </div>
    </div>
  );
}
