import styled from "styled-components";
import { useReactorSheetContext } from "../context";

const ActionsGrid = styled.div`
  display: grid;
`;

const ActionCard = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

/**
 * TODO:
 * - reference: https://www.dndbeyond.com/characters/91477249
 * - Implement table headers and rows using a grid layout
 *
 */

const columns = [
  {
    header: "",
    value: (item) => (
      <div style={{ width: "50px" }}>
        <img
          src={item.img}
          alt={item.name}
          className="item-image"
          width="100%"
        />
      </div>
    ),
  },
  {
    header: "Attack",
  },
  {
    header: "Hit",
  },
  {
    header: "Damage",
  },
  {
    header: "Notes",
  },
];
export default function ActionsPage() {
  const { items } = useReactorSheetContext();
  const weapons = items.filter((i) => i.type === "weapon");
  return (
    <div>
      <ActionsGrid className="flex-col">
        {weapons
          .filter((i) => i.type === "weapon")
          .map((i) => (
            <ActionCard
              key={`action-card-${i._id}`}
              classNames="flex-row p-3 justify-between"
            >
              <div className="flex-row align-center">
                <div style={{ width: "50px" }}>
                  <img
                    src={i.img}
                    alt={i.name}
                    className="item-image"
                    width="100%"
                  />
                </div>
                <div>
                  <a
                    className="item-control item-show"
                    onClick={() => i.sheet?.render(true)}
                  >
                    <h5 className="m-0">{i.name}</h5>
                  </a>
                  <div>
                    {i.system.qualities.map((t) => (
                      <span
                        key={`${i._id}-tag-${t.label}`}
                        className="badge mr-1"
                      >
                        {t.icon && <i className={"m-1 fa " + t.icon}></i>}
                        {t.label}{" "}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex-row align-center">
                <button onClick={() => i.rollWeapon({ skipDialog: true })}>
                  {i.system.damage}
                </button>
                <button className="item-control item-delete">Delete</button>
              </div>
            </ActionCard>
          ))}
      </ActionsGrid>
    </div>
  );
}
