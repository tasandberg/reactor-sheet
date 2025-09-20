import styled from "styled-components";
import { TextTiny } from "../../shared/elements";
import GridTable from "../../shared/GridTable";
import type { GridTableColumn } from "../../shared/constants";
import { colors, spacer } from "../../shared/elements-vars";

const ActionHeader = styled.div`
  padding: ${spacer.xs};
  border-bottom: 1px solid ${colors.hint};
  margin-bottom: ${spacer.sm};
  width: 100%;
`;

export default function ActionTable<T>({
  data,
  columns,
  getRowId,
  title,
  columnRepeat,
  showHeader = true,
}: {
  data: T[];
  columns: GridTableColumn<T>[];
  getRowId: (row: T) => string;
  title: string;
  columnRepeat?: number;
  showHeader?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto",
        marginBottom: spacer.lg,
      }}
    >
      <ActionHeader>
        <TextTiny $color="label">{title}</TextTiny>
      </ActionHeader>
      <GridTable<T>
        columns={columns}
        data={data}
        getRowId={getRowId}
        showHeader={showHeader}
        columnRepeat={columnRepeat}
      />
    </div>
  );
}
