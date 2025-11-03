import { useEffect, useState, type SyntheticEvent } from "react";
import { useReactorSheetContext } from "../context";
import { IncrementButton, TextSmall } from "../shared/elements";
import { ProgressBar } from "../shared/ProgressBar";

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
        display: "grid",
        gridTemplateColumns: "auto auto",
        alignItems: "center",
        justifyItems: "end",
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
          height: "25px",
          width: "50px",
          textAlign: "center",
          color: "var(--color-text-emphatic)",
        }}
        onChange={(e) => setMaxHp(Number((e.target as HTMLInputElement).value))}
        name="system.hp.max"
      />
      <button style={{ gridColumnStart: "span 2" }} type="submit">
        Done
      </button>
    </form>
  ) : (
    <div className="flex-row align-center gap-1 w-100">
      <ProgressBar
        $color="green"
        $percentage={(currentHp / actor.system.hp.max) * 100}
        onClick={() => setIsEditing(true)}
        className="cursor-pointer"
      >
        <TextSmall>
          {currentHp} / {actor.system.hp.max}
        </TextSmall>
      </ProgressBar>
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
  );
}
