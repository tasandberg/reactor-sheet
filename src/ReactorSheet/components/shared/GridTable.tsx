import styled from "styled-components";
import type { GridTableColumn } from "./constants";
import { Fragment } from "react/jsx-runtime";
import { colors, fontSizes } from "./elements-vars";
import { TextSmall } from "./elements";

const GridTableWrapper = styled.div<{
  $gridTemplateColumns: string;
}>`
  display: grid;
  gap: 10px;
  width: 100%;
  grid-template-columns: ${(props) => props.$gridTemplateColumns}};
`;

const GridTableHeader = styled.span`
  text-transform: uppercase;
  font-size: ${fontSizes.tiny};
  color: ${colors.label};
`;

const GridTableCell = styled.div<{
  $justify?: "start" | "center" | "end";
  $align?: "start" | "center" | "end";
  $header?: boolean;
  $width?: string;
}>`
  align-items: ${(props) => props.$align || "center"};
  justify-content: ${(props) => props.$justify || "end"};
  display: flex;
  width: ${(props) => props.$width || "auto"};
`;

export default function GridTable<T>({
  columns,
  data,
  getRowId,
  showHeader = true,
  columnRepeat,
}: {
  columns: GridTableColumn<T>[];
  getRowId: (row: T) => string;
  data: T[];
  showHeader?: boolean;
  columnRepeat?: number;
}) {
  let gridTemplateColumns = columns
    .map((col) => col.width || "max-content")
    .join(" ");

  if (columnRepeat) {
    gridTemplateColumns = `repeat(${columnRepeat}, ${gridTemplateColumns})`;
  }

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
                $width={col.width}
              >
                {col.renderCell ? (
                  col.renderCell(row)
                ) : col.getValue ? (
                  <TextSmall>{col.getValue(row)}</TextSmall>
                ) : null}
              </GridTableCell>
            ))}
          </Fragment>
        );
      })}
    </GridTableWrapper>
  ) : null;
}
