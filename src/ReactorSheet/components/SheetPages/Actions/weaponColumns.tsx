import type { OSEActor, OseWeapon } from "@src/ReactorSheet/types/types";
import type { GridTableColumn } from "../../shared/constants";
import styled from "styled-components";
import { Row, Text, TextSmall, TextTiny } from "../../shared/elements";
import { colors, fontSizes } from "../../shared/elements-vars";

const DiceHoverButton = styled.button`
  padding: 0;
  border: none;
  background: none;

  i {
    opacity: 0;
  }

  &:hover {
    img {
      opacity: 0.5;
    }
    i {
      opacity: 1;
    }
  }
`;

// eslint-disable-next-line react-refresh/only-export-components
function InlineWeaponRollButton({
  formula,
  flavor,
  mod,
  missile,
}: {
  missile?: boolean;
  formula: string;
  flavor: string;
  mod: string;
}) {
  return (
    <a
      className="inline-roll roll"
      data-mode="roll"
      data-formula={formula}
      data-tooltip-text={formula}
      data-flavor={flavor}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        width: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Text $color="hint">
        <i
          className={missile ? "fa fa-bow-arrow" : "fa fa-sword"}
          style={{
            fontSize: fontSizes.sm,
            color: colors.hint,
            alignSelf: "center",
          }}
        />
        {": "}
      </Text>
      <TextSmall>{mod}</TextSmall>
    </a>
  );
}

function getModString(mod: number) {
  return mod >= 0 ? `+${mod}` : `-${Math.abs(mod)}`;
}

export const weaponActionColumns = (
  actor: OSEActor
): GridTableColumn<OseWeapon>[] => {
  const scores = actor.system.scores;

  return [
    {
      header: "Item",
      name: "image",
      justify: "start",
      align: "start",
      width: "1fr",
      renderCell: (item) => {
        return (
          <Row>
            <div style={{ width: "30px" }}>
              <DiceHoverButton
                onClick={() => item.rollWeapon({ skipDialog: false })}
                style={{ padding: 0, border: "none", background: "none" }}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="item-image"
                  width="100%"
                />
                <i
                  className="fa fa-dice-d20"
                  style={{ position: "absolute", fontSize: "18px" }}
                />
              </DiceHoverButton>
            </div>
            <div className="flex-col gap-0">
              <a onClick={() => item.sheet.render(true)}>
                <TextSmall>{item.name as string}</TextSmall>
              </a>
              <Row style={{ opacity: 0.5 }}>
                {item.system.qualities.map((q, i) => (
                  <TextTiny key={`qt${i}${q.label}`}>
                    <i
                      className={"fa " + q.icon}
                      style={{ marginRight: "0px" }}
                    />{" "}
                    {q.label}
                  </TextTiny>
                ))}
              </Row>
            </div>
          </Row>
        );
      },
    },
    {
      header: "Hit",
      name: "hit",
      justify: "start",
      align: "start",
      width: "80px",
      renderCell: (item) => {
        let [meleeMod, missileMod] = [null, null];
        if (item.system.melee) {
          meleeMod = (
            <InlineWeaponRollButton
              formula={`1d20+${scores.str.mod}`}
              flavor={`${actor.name} attacks with ${item.name}`}
              mod={getModString(scores.str.mod)}
            />
          );
        }
        if (item.system.missile && scores.dex.mod !== 0) {
          missileMod = (
            <InlineWeaponRollButton
              formula={`1d20+${scores.dex.mod}`}
              flavor={`${actor.name} attacks with ${item.name} (ranged)`}
              mod={getModString(scores.dex.mod)}
              missile
            />
          );
        }
        return (
          <div
            style={{
              justifyContent: "start",
              alignItems: "start",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {meleeMod}
            {missileMod && missileMod}
          </div>
        );
      },
    },
    {
      header: "Damage",
      name: "damage",
      justify: "start",
      align: "start",
      width: "80px",
      renderCell: (item) => {
        let meleeDmg = null;
        let missileDmg = null;
        if (item.system.melee) {
          meleeDmg = (
            <InlineWeaponRollButton
              formula={`${item.system.damage}+${scores.str.mod}`}
              flavor={`${actor.name} deals damage with ${item.name}`}
              mod={item.system.damage + getModString(scores.str.mod)}
            />
          );
        }

        if (item.system.missile) {
          missileDmg = (
            <InlineWeaponRollButton
              formula={`${item.system.damage}`}
              flavor={`${actor.name} deals damage with ${item.name} (ranged)`}
              mod={item.system.damage}
              missile
            />
          );
        }

        return (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "start",
              height: "100%",
              width: 80,
              gap: 2,
            }}
          >
            {meleeDmg}
            {missileDmg}
          </div>
        );
      },
    },

    {
      header: "Attack!",
      name: "roll",
      justify: "start",
      align: "start",
      width: "max-content",
      renderCell: (item) => {
        return (
          <button
            key={`${item.id}-attack-button`}
            style={{ width: "50px" }}
            title={"Auto-roll hit and damage against target"}
            onClick={() => {
              item.rollWeapon({ skipDialog: false });
            }}
          >
            <i className="fas fa-dice-d20" />
          </button>
        );
      },
    },
  ];
};
