import { useReactorSheetContext } from "../context";
import { Column, TextSmall } from "../shared/elements";
import styled from "styled-components";
import { colors, fontSizes } from "../shared/elements-vars";
import Heart from "./HPHeart";
import { CharacterInputField } from "./shared-elements";

const IncButton = styled.div`
  font-size: 8px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  background-color: ${colors.bgDark1};
  border: 0.5px solid ${colors.hint};
  box-sizing: border-box;
  padding: 2px 2px;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
  &:first-child {
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }
  &:last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
`;

const HPContainer = styled.div`
  display: grid;
  grid-template-columns: min-content max-content;
  height: 100%;
  width: 100%;
`;
export default function ActorInfoHeaderHP() {
  const { actor, updateActor } = useReactorSheetContext();

  const { value: currentHp, max: maxHp } = actor.system.hp;

  const clampHp = (hp: number) => {
    return Math.clamp(hp, 0, maxHp);
  };

  const preventTabbing = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).blur();
    }
  };

  return (
    <HPContainer>
      <div
        style={{
          gridColumn: "1/-1",
          textAlign: "center",
        }}
      >
        <TextSmall $color="label">Hit Points</TextSmall>
      </div>
      {/* Controls */}
      <Column
        $width="auto"
        $align="center"
        $justify="center"
        style={{
          gap: 2,
          flexGrow: 0,
        }}
      >
        <IncButton
          role="button"
          title={"Increase Hit Points by 1"}
          onClick={async () =>
            await updateActor({
              "system.hp.value": clampHp(currentHp + 1),
            })
          }
        >
          <i className="fas fa-plus" />
        </IncButton>
        <IncButton
          role="button"
          title={"Reduce Hit Points by 1"}
          onClick={async () =>
            await updateActor({
              "system.hp.value": clampHp(currentHp - 1),
            })
          }
        >
          <i className="fas fa-minus" />
        </IncButton>
      </Column>
      <Column $gap="none" $align="center" $justify="start">
        <div
          style={{
            width: 35,
            height: 35,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
          className="position-relative"
        >
          <CharacterInputField
            style={{
              fontSize: fontSizes.md,
              width: Math.min(String(maxHp).length * 15, 30),
              // border: "1px solid red",
              padding: 0,
              textAlign: "center",
              position: "absolute",
              marginTop: "-4px",
            }}
            onKeyDown={preventTabbing}
            type="number"
            tabIndex={-1}
            name="hp"
            min={0}
            max={maxHp}
            onChange={async (e) => {
              const newHp = clampHp(Number(e.target.value));
              e.target.value = String(newHp);
              await updateActor({ "system.hp.value": newHp });
            }}
            value={String(currentHp)}
          />
          <Heart value={currentHp} max={maxHp} />
        </div>
      </Column>
    </HPContainer>
  );
}
