import type { OseAbility } from "@src/ReactorSheet/types/types";
import { useReactorSheetContext } from "../../context";
import type { GridTableColumn } from "../../shared/constants";
import { Badge, Column, TextLarge } from "../../shared/elements";
import GridTable from "../../shared/GridTable";
import { showDeleteDialog } from "../../shared/foundryDialogs";
import Languages from "../Notes/Languages";
import {
  addAbilitiesToCharacter,
  getClassAbilities,
  getRaceAbilities,
  resetAbilities,
} from "@src/lib/ose-compendiums";
import { APP_ID } from "@src/constants";

const abilityColumns: GridTableColumn<OseAbility>[] = [
  {
    name: "image",
    header: "",
    width: "40px",
    renderCell: (item) => (
      <a onClick={() => item.sheet.render(true)}>
        <img
          src={item.img}
          alt={item.name}
          style={{ width: "35px", height: "35px" }}
        />
      </a>
    ),
  },
  {
    name: "ability",
    align: "center",
    justify: "start",
    header: "Ability",
    width: "2fr",
    renderCell: (item) => (
      <a onClick={() => item.sheet.render(true)}>{item.name}</a>
    ),
  },
  {
    name: "requirements",
    header: "Source",
    align: "center",
    justify: "start",
    renderCell: (item) =>
      item.system.requirements ? (
        <Badge>{item.system.requirements}</Badge>
      ) : null,
  },
  {
    name: "Delete",
    header: "",
    width: "40px",
    renderCell: (item) => (
      <a
        className="btn btn-danger btn-sm"
        onClick={() => showDeleteDialog(item)}
        title="Delete Ability"
      >
        <i className="fas fa-trash" />
      </a>
    ),
  },
];

export default function Abilities() {
  const { actor } = useReactorSheetContext();
  const abilities = Object.values(actor.system.abilities ?? {});
  return (
    <Column $justify="start" $align="start" $gap="md">
      <TextLarge>Abilities</TextLarge>
      <button
        onClick={async () => {
          const abilities = await getRaceAbilities(actor.flags[APP_ID]?.race);
          await addAbilitiesToCharacter(actor, abilities);
        }}
      >
        Add race abilities ({actor.flags[APP_ID]?.race})
      </button>
      <button
        onClick={async () => {
          const abilities = await getClassAbilities(actor.system.details.class);
          await addAbilitiesToCharacter(actor, abilities);
        }}
      >
        Add class abilities ({actor.system.details.class})
      </button>
      <button
        onClick={async () => {
          await resetAbilities(actor);
        }}
      >
        🗑️ Reset Abilities
      </button>
      <GridTable<OseAbility>
        showHeader={false}
        columns={abilityColumns}
        data={abilities}
        getRowId={(item) => item._id}
      />
      <Languages />
    </Column>
  );
}
