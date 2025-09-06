import styled from "styled-components";
import type { GridTableColumn } from "./constants";
import { Fragment } from "react/jsx-runtime";

const GridTableWrapper = styled.div<{
  $gridTemplateColumns: string;
}>`
  display: grid;
  gap: 10px;
  grid-template-columns: ${(props) => props.$gridTemplateColumns}};
`;

const GridTableHeader = styled.span`
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

const GridTableCell = styled.div<{
  $justify?: "start" | "center" | "end";
  $align?: "start" | "center" | "end";
  $header?: boolean;
}>`
  align-items: ${(props) => props.$align || "center"};
  justify-content: ${(props) => props.$justify || "end"};
  display: flex;
`;

const Divider = styled.div`
  height: 1px;
  background-color: var(--color-text-secondary);
  opacity: 0.5;
  grid-column: 1 / -1;
  margin-top: -5px;
`;

export default function GridTable<T>({
  columns,
  data,
  getRowId,
  showHeader = true,
}: {
  columns: GridTableColumn<T>[];
  getRowId: (row: T) => string;
  data: T[];
  showHeader?: boolean;
}) {
  const gridTemplateColumns = columns
    .map((col) => col.width || "max-content")
    .join(" ");

  return data.length > 0 ? (
    <GridTableWrapper $gridTemplateColumns={gridTemplateColumns}>
      {showHeader && (
        <>
          {columns.map((col) => (
            <GridTableCell
              key={`h${col.name}-${getRowId(data[0])}`}
              $align={col.align}
              $justify={col.justify}
              $header
            >
              <GridTableHeader>{col.header}</GridTableHeader>
            </GridTableCell>
          ))}
          <Divider />
        </>
      )}
      {data.map((row, rowIndex) => {
        const rowId = (getRowId && getRowId(row)) ?? rowIndex;
        return (
          <Fragment key={`gt-row-${rowId}`}>
            {columns.map((col) => (
              <GridTableCell
                key={`r${col.name}-${rowId}`}
                $align={col.align}
                $justify={col.justify}
              >
                {col.renderCell
                  ? col.renderCell(row)
                  : col.getValue
                  ? col.getValue(row)
                  : null}
              </GridTableCell>
            ))}
          </Fragment>
        );
      })}
    </GridTableWrapper>
  ) : null;
}
