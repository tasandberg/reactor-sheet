import type { OSEActor } from "@src/ReactorSheet/types/types";
import { Column, Row, TextSmall } from "../shared/elements";
import { InlineInput } from "../InlineInput";
import { diceIcon, spacer } from "../shared/elements-vars";
import GenericProgress from "../shared/GenericProgress";
import { APP_ID } from "@src/constants";
import { getHitDice, getNextLevelXp } from "@src/lib/class-data";

function ActorInfoField({
  label,
  value,
  name,
  update,
  children,
}: {
  label: string;
  value?: string | number;
  name: string;
  update?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputSize?: number;
  children?: React.ReactNode;
}) {
  const renderValue = () => {
    if (children) {
      return (
        <div
          style={{
            height: "20px",
            paddingLeft: spacer.xs,
            flexGrow: 0,
          }}
        >
          {children}
        </div>
      );
    }
    if (update) {
      return (
        <TextSmall>
          <InlineInput
            type={typeof value === "number" ? "number" : "text"}
            style={{
              height: "20px",
              paddingLeft: spacer.xs,
            }}
            name={name}
            defaultValue={value}
            onBlur={update}
          />
        </TextSmall>
      );
    }
    return <TextSmall className="pl-1">{value}</TextSmall>;
  };
  return (
    <Row
      $justify="start"
      $align="center"
      $gap="none"
      style={{ width: "200px" }}
    >
      <TextSmall $color="label" style={{ width: "80px" }}>
        {label}
      </TextSmall>
      <div style={{ flexGrow: 1 }}>{renderValue()}</div>
    </Row>
  );
}

export default function CharacterDetails({
  actor,
  handleChange,
  oseMode,
}: {
  actor: OSEActor;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  oseMode: { advanced: boolean };
}) {
  const nextLevel = getNextLevelXp(
    actor.system.details.class,
    Number(actor.system.details.level)
  );

  const hitDice = getHitDice(
    actor.system.details.class,
    Number(actor.system.details.level)
  );
  console.log({ hitDice });

  return (
    <>
      <Row $wrap $align="start" $justify="start" $gap="xs">
        <Column
          $justify="start"
          $align="start"
          $width="auto"
          $grow={1}
          $gap={"xs"}
          style={{ height: "100%" }}
        >
          {oseMode.advanced && (
            <ActorInfoField
              label="Race:"
              name={`flags.${APP_ID}.race`}
              value={actor.flags[APP_ID]?.race || ""}
              update={handleChange}
              inputSize={80}
            />
          )}
          <ActorInfoField
            label={"Alignment:"}
            name="system.details.alignment"
            value={actor.system.details.alignment}
            update={handleChange}
          />
          <ActorInfoField
            label={"Title:"}
            name="system.details.title"
            value={actor.system.details.title}
            inputSize={100}
            update={handleChange}
          />
        </Column>
        <Column
          $justify="start"
          $align="start"
          $width="auto"
          $grow={1}
          $gap={"xs"}
        >
          <ActorInfoField
            label="XP:"
            name="system.details.xp.value"
            value={actor.system.details.xp.value}
            update={handleChange}
          />
          <ActorInfoField
            label="Next Level:"
            name="system.details.xp.next"
            value={nextLevel}
          />

          <ActorInfoField name="system.details.hitDice" label="Hit Dice:">
            <a
              className="inline-roll roll text-sm"
              data-mode="roll"
              data-formula={hitDice}
              data-tooltip-text={`Hit Dice ${hitDice}`}
              data-flavor={`Hit Die`}
            >
              <i className={diceIcon[hitDice.slice(1, 3)]} />
              {hitDice}
            </a>
          </ActorInfoField>
        </Column>
        <Row>
          <TextSmall $color="label">Encumbrance:</TextSmall>
          <GenericProgress
            max={actor.system.encumbrance.max}
            styles={{ width: "120px" }}
            value={actor.system.encumbrance.value}
          />
          <TextSmall>
            {actor.system.encumbrance.value}/{actor.system.encumbrance.max}gp
          </TextSmall>
        </Row>
      </Row>
    </>
  );
}
