import { cx } from "./cx";
import type { HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLSpanElement> & {
  intent?: "teal" | "crimson" | "forest" | "mustard" | "solid" | "count";
};

export function Tag({ intent, className, ...rest }: Props) {
  return <span className={cx("tag", intent, className)} {...rest} />;
}
