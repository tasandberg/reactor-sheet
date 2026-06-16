import { cx } from "./cx";
import type { CSSProperties } from "react";

export function Skeleton({ width, height, className }: { width?: CSSProperties["width"]; height?: CSSProperties["height"]; className?: string }) {
  return <div className={cx("skel", className)} style={{ width, height }} />;
}
