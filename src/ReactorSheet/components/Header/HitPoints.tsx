import { useEffect, useState, type SyntheticEvent } from "react";
import { useReactorSheetContext } from "../context";
import { TextSmall, Text, TextTiny, Row, Column } from "../shared/elements";
import { ProgressBar } from "../shared/ProgressBar";
import styled from "styled-components";
import { colors } from "../shared/elements-vars";

const IncButton = styled.div`
  font-size: 8px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: ${colors.bgDark1};
  border: 1px solid ${colors.label};
  box-sizing: border-box;
  padding: 4px;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
  &:first-child {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
  }
  &:last-child {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
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

  return isEditing ? (
    <form
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyItems: "end",
        height: "25px",
        gap: "0.5rem",
      }}
      onSubmit={onChangeHp}
    >
      <TextSmall $color="secondary">Current:</TextSmall>
      <input
        id="hp-current"
        value={currentHp}
        type="number"
        style={{
          height: "25px",
          width: "50px",
          textAlign: "center",
          color: "var(--color-text-emphatic)",
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
          width: "50px",
          textAlign: "center",
          color: "var(--color-text-emphatic)",
        }}
        onChange={(e) => setMaxHp(Number((e.target as HTMLInputElement).value))}
        name="system.hp.max"
      />
      <button onClick={onChangeHp}>Done</button>
    </form>
  ) : (
    <Row style={{ height: "28px" }} $gap="xs">
      <ProgressBar
        $color="green"
        $percentage={(currentHp / actor.system.hp.max) * 100}
        onClick={() => setIsEditing(true)}
        className="cursor-pointer"
        style={{ flexGrow: 1, flexShrink: 0, width: "100%" }}
      >
        <Text className="mr-1">{currentHp}</Text>
        <TextTiny>/ {actor.system.hp.max}</TextTiny>
      </ProgressBar>
      <Row
        $width="auto"
        style={{
          gap: 2,
          height: "100%",
          flexGrow: 0,
        }}
      >
        <IncButton
          role="button"
          onClick={async () =>
            await updateActor({ "system.hp.value": clampHp(currentHp - 1) })
          }
        >
          <i className="fas fa-minus" />
        </IncButton>
        <IncButton
          role="button"
          onClick={async () =>
            await updateActor({ "system.hp.value": clampHp(currentHp + 1) })
          }
        >
          <i className="fas fa-plus" />
        </IncButton>
      </Row>
    </Row>
  );
}
