import type { OSEActor, OseItem } from "@src/ReactorSheet/types/types";
import GridTable from "../../shared/GridTable";
import type { GridTableColumn } from "../../shared/constants";
import { SectionHeader } from "../../shared/elements";
import { InlineInput } from "../../InlineInput";

const columns: GridTableColumn<OseItem>[] = [
  {
    name: "Image",
    header: "",
    align: "center",
    justify: "start",
    width: "max-content",
    renderCell: (item) => (
      <img
        src={item.img}
        alt={item.name}
        style={{ width: "15px", height: "15px", objectFit: "cover" }}
      />
    ),
  },
  {
    name: "Name",
    header: "Name",
    align: "start",
    justify: "start",

    renderCell: (item) => (
      <a onClick={() => item.sheet.render(true)}>{item.name as string}</a>
    ),
  },
  {
    name: "Value",
    header: "Value",
    align: "start",
    justify: "end",
    width: "max-content",
    getValue: (item) => item.system.cost + " gp",
  },
  {
    name: "Quantity",
    header: "Qty",
    align: "center",
    justify: "end",
    width: "1fr",
    renderCell: (item) => (
      <InlineInput
        name="quantity"
        defaultValue={item.system.quantity.value}
        style={{ width: "auto", textAlign: "right" }}
        onBlur={(e) =>
          item.update({ "system.quantity.value": Number(e.target.value) })
        }
      />
    ),
  },
  {
    name: "Worth",
    header: "Worth",
    align: "center",
    justify: "end",
    getValue: (item) => item.system.cumulativeCost,
  },
  {
    name: "Weight",
    header: "Weight",
    align: "center",
    justify: "end",
    width: "max-content",
    getValue: (item) => item.system.cumulativeWeight,
  },
];

export default function Money({ actor }: { actor: OSEActor }) {
  const treasures = Object.values(actor.system.treasures);
  return (
    <>
      <SectionHeader className="mt-0">Treasure</SectionHeader>
      <div style={{ marginBottom: "3rem" }} className="pl-3 pr-3">
        <GridTable<OseItem>
          showHeader
          getRowId={(row) => `money-gt-${row._id}`}
          columns={columns}
          data={treasures || []}
        />
      </div>
    </>
  );
}
