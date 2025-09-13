import styled from "styled-components";
import { useEffect, useState, type SyntheticEvent } from "react";
import { useReactorSheetContext } from "../context";
import { TextSmall, TextTiny } from "../shared/elements";

const HitPointsBar = styled.div<{ $percentage: number }>`
  width: 100%;
  height: 20px;
  position: relative;
  border-radius: 25px;
  box-shadow: inset 0 0 7px #000000;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 0 8px;

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
    color: var(--color-text-emphasis);
  }
`;

const IncrementButton = styled.button`
  min-width: 20px;
  min-height: 20px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 100%;
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
  const [maxHp, setMaxHp] = useState(actor.system.hp.max);
  useEffect(() => {
    setCurrentHp(actor.system.hp.value);
    setMaxHp(actor.system.hp.max);
  }, [actor.system.hp.value, actor.system.hp.max]);

  const [isEditing, setIsEditing] = useState(false);

  const onChangeHp = async (e: SyntheticEvent) => {
    e.preventDefault();
    const newHp = Math.clamp(Number(currentHp), 0, Number(maxHp));
    const newMaxHp = Math.max(Number(maxHp), 1);
    await updateActor({
      "system.hp.value": newHp,
      "system.hp.max": newMaxHp,
    });
    setCurrentHp(newHp);
    setMaxHp(newMaxHp);

    setIsEditing(false);
  };

  const clampHp = (hp: number) => {
    return Math.clamp(hp, 0, actor.system.hp.max);
  };

  return (
    <div className="flex-col gap-1 w-100">
      {isEditing ? (
        <form className="flex-row align-center gap-2" onSubmit={onChangeHp}>
          <TextSmall $color="secondary">Current:</TextSmall>
          <input
            id="hp-current"
            value={currentHp}
            type="number"
            style={{
              height: "25px",
              width: "50px",
              textAlign: "center",
              color: "var(--color-text-emphasis)",
            }}
            onChange={(e) =>
              setCurrentHp(Number((e.target as HTMLInputElement).value))
            }
            name="system.hp.value"
          />
          <TextSmall $color="secondary">Max:</TextSmall>
          <input
            id="hp-max"
            type="number"
            value={maxHp}
            style={{
              height: "25px",
              width: "50px",
              textAlign: "center",
              color: "var(--color-text-emphasis)",
            }}
            onChange={(e) =>
              setMaxHp(Number((e.target as HTMLInputElement).value))
            }
            name="system.hp.max"
          />
          <button type="submit">Done</button>
        </form>
      ) : (
        <div className="flex-row align-center gap-1">
          <HitPointsBar
            $percentage={(currentHp / actor.system.hp.max) * 100}
            onClick={() => setIsEditing(true)}
            className="cursor-pointer"
          >
            <TextTiny>
              {currentHp} / {actor.system.hp.max}
            </TextTiny>
          </HitPointsBar>
          <IncrementButton
            onClick={async () =>
              await updateActor({ "system.hp.value": clampHp(currentHp - 1) })
            }
          >
            <i className="fas fa-minus" />
          </IncrementButton>
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
  );
}
