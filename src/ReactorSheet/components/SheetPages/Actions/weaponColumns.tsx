import type { OSEActor, OseWeapon } from "@src/ReactorSheet/types/types";
import type { GridTableColumn } from "../../shared/constants";
import styled from "styled-components";
import { Badge, Row, Text } from "../../shared/elements";
import { InlineRollButton } from "../../shared/InlineRollButton";
import { colors, fontSizes } from "../../shared/elements-vars";

const DiceHoverButton = styled.button`
  padding: 0;
  border: none;
  background: none;

  i {
    opacity: 0;
    transition: 0.5 ease;
  }

  &:hover {
    img {
      opacity: 0;
    }
    i {
      opacity: 1;
    }
  }
`;

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
            <div style={{ width: "25px" }}>
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
            <a onClick={() => item.sheet.render(true)}>
              <Text>{item.name as string}</Text>
            </a>
          </Row>
        );
      },
    },
    {
      header: "Notes",
      name: "notes",
      justify: "start",
      align: "start",
      width: "200px",
      renderCell: (item) => (
        <div className="flex-row" style={{ flexWrap: "wrap", gap: "0.5rem" }}>
          {item.system.qualities.map((q, i) => (
            <Badge
              key={`qt${i}${q.label}`}
              title={q.label}
              style={{ display: "inline" }}
              className="badge"
            >
              <i className={"pr-1 fa " + q.icon} /> {q.label}
            </Badge>
          ))}
        </div>
      ),
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
            <InlineRollButton
              formula={`1d20+${scores.str.mod}`}
              flavor={`${actor.name} attacks with ${item.name}`}
            >
              <Text>
                <i
                  className="fa fa-sword"
                  style={{ fontSize: fontSizes.tiny, color: colors.label }}
                />
                {": "}
                {getModString(scores.str.mod)}
              </Text>
            </InlineRollButton>
          );
        }
        if (item.system.missile && scores.dex.mod !== 0) {
          missileMod = (
            <InlineRollButton
              formula={`1d20+${scores.dex.mod}`}
              flavor={`${actor.name} attacks with ${item.name} (ranged)`}
            >
              <Text>
                <i
                  className="fa fa-bow-arrow"
                  style={{ fontSize: fontSizes.tiny, color: colors.label }}
                />
                {": "}
                {getModString(scores.dex.mod)}
              </Text>
            </InlineRollButton>
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
            <InlineRollButton
              formula={`${item.system.damage}+${scores.str.mod}`}
              flavor={`${actor.name} deals damage with ${item.name}`}
            >
              <Text>
                <i
                  className="fa fa-sword"
                  style={{ fontSize: fontSizes.tiny, color: colors.label }}
                />
                {": "}
                {item.system.damage}
                {getModString(scores.str.mod)}
              </Text>
            </InlineRollButton>
          );
        }

        if (item.system.missile) {
          missileDmg = (
            <InlineRollButton
              formula={`${item.system.damage}`}
              flavor={`${actor.name} deals damage with ${item.name} (ranged)`}
            >
              <Text>
                <i
                  className="fa fa-bow-arrow"
                  style={{ fontSize: fontSizes.tiny, color: colors.label }}
                />
                {": "}
                {item.system.damage}
              </Text>
            </InlineRollButton>
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
            onClick={() => item.rollWeapon({ skipDialog: false })}
          >
            <i className="fas fa-dice-d20" />
          </button>
        );
      },
    },
  ];
};
