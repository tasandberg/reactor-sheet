export type GridTableColumn<T> = {
  header: string;
  getValue?: (row: T) => string | number | undefined;
  name: string;
  renderCell?: (row: T) => React.ReactNode;
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end";
  width?: string;
};
