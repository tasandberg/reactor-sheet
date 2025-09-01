import styled from "styled-components";
import type { GridTableColumn } from "./constants";

const GridTableWrapper = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: auto repeat(${({ $columns }) => $columns - 1}, 1fr);
  grid-template-rows: min-content;
  gap: 10px;
`;

const GridTableHeader = styled.span`
  text-transform: uppercase;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
`;

const GridTableCell = styled.div<{
  $justify?: "start" | "center" | "end";
  $align?: "start" | "center" | "end";
  $width?: string;
  $header?: boolean;
}>`
  align-items: ${(props) => props.$align || "center"};
  justify-content: ${(props) => props.$justify || "end"};
  display: flex;
  width: ${(props) => props.$width || "auto"};
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
}: {
  columns: GridTableColumn<T>[];
  data: T[];
}) {
  console.log(columns, data);
  return (
    <GridTableWrapper $columns={columns.length}>
      {columns.map((col) => (
        <GridTableCell
          key={col.name}
          $align={col.align}
          $width={col.width}
          $justify={col.justify}
          $header
        >
          <GridTableHeader>{col.header}</GridTableHeader>
        </GridTableCell>
      ))}
      <Divider />
      {data.map((row, rowIndex) =>
        columns.map((col) => (
          <GridTableCell
            key={`${rowIndex}-${col.name}`}
            $align={col.align}
            $width={col.width}
            $justify={col.justify}
          >
            {col.renderCell
              ? col.renderCell(row)
              : col.getValue
              ? col.getValue(row)
              : null}
          </GridTableCell>
        ))
      )}
    </GridTableWrapper>
  );
}
