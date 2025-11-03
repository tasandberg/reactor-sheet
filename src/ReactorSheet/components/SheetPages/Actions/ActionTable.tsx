import { ActionHeader, Text } from "../../shared/elements";
import GridTable from "../../shared/GridTable";
import type { GridTableColumn } from "../../shared/constants";

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
  title?: string;
  columnRepeat?: number;
  showHeader?: boolean;
}) {
  return (
    <div
      style={{
        width: "100%",
        margin: "0 auto",
      }}
    >
      {title && (
        <ActionHeader>
          <Text>{title}</Text>
        </ActionHeader>
      )}
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
