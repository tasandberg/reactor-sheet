import type { OseAbility } from "@src/ReactorSheet/types/types";
import { useReactorSheetContext } from "../../context";
import type { GridTableColumn } from "../../shared/constants";
import { Badge, SectionHeader } from "../../shared/elements";
import GridTable from "../../shared/GridTable";

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
          style={{ width: "32px", height: "32px", borderRadius: "4px" }}
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
];
export default function Abilities() {
  const { actor } = useReactorSheetContext();
  const abilities = Object.values(actor.system.abilities ?? {});
  return (
    <div>
      <SectionHeader>Abilities</SectionHeader>
      <GridTable<OseAbility>
        showHeader={false}
        columns={abilityColumns}
        data={abilities}
        getRowId={(item) => item._id}
      />
    </div>
  );
}
