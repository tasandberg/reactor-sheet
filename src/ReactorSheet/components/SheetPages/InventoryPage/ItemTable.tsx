import type { OseItem } from "@src/ReactorSheet/types/types";
import clsx from "clsx";
import { useState } from "react";

export type ItemTableColumn = {
  name: string;
  getCell?: (
    item: OseItem
  ) => string | number | React.ReactNode | null | undefined;
  getValue?: (item: OseItem) => string | number | undefined | null;
  classes?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  showHeader?: boolean;
};

export default function ItemTable({
  columns,
  items,
}: {
  columns: ItemTableColumn[];
  items: OseItem[];
}) {
  const [sort, setSort] = useState({ column: "", direction: 1 });

  const sortedItems = items.sort((a, b) => {
    if (!sort.column) return 0;
    const col = columns.find((c) => c.name === sort.column);
    if (!col || !col.sortable) return 0;
    const aValue = col.getValue(a);
    const bValue = col.getValue(b);
    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1 * sort.direction;
    if (bValue === null || bValue === undefined) return -1 * sort.direction;
    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * sort.direction;
    }
    return aValue.toString().localeCompare(bValue.toString()) * sort.direction;
  });

  const handleSort = (colName: string) => {
    setSort((currentSort) => {
      if (currentSort.column === colName) {
        return {
          column: colName,
          direction: -currentSort.direction,
        };
      }
      return { column: colName, direction: 1 };
    });
  };

  return (
    <table>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={`header-${col.name}-${i}`}
              className="border border-gray-300 px-4 py-2 text-left bg-gray-100"
              align={col.align ?? "right"}
            >
              {col.sortable ? (
                <a
                  className="underline flex-row gap-0 align-center"
                  onClick={() => handleSort(col.name)}
                >
                  <span
                    style={{ fontSize: "0.5em" }}
                    className={clsx("mr-1", {
                      "opacity-0": sort.column !== col.name,
                    })}
                  >
                    {sort.direction === 1 ? " ▲" : " ▼"}
                  </span>
                  {col.name}
                </a>
              ) : (
                col.name
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedItems.map((item) => (
          <tr key={item._id} className="hover:bg-gray-50" draggable="true">
            {columns.map((col, i) => (
              <td
                key={`cell-${i}-${col.name}-${item._id}`}
                className={col.classes ?? ""}
                align={col.align ?? "right"}
              >
                {(col.getCell && col.getCell(item)) ||
                  col?.getValue(item) ||
                  null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
