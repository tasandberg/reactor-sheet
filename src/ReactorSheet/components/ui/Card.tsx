import { cx } from "./cx";
import type { HTMLAttributes } from "react";

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("card", className)} {...rest} />;
}

export function KvCard({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("kv-card", className)} {...rest} />;
}
