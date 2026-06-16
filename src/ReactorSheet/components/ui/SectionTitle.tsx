import { cx } from "./cx";
import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLHeadingElement> & { hint?: ReactNode };

export function SectionTitle({ hint, children, className, ...rest }: Props) {
  return (
    <h3 className={cx("section-title", className)} {...rest}>
      {children}
      {hint != null && <span className="hint">{hint}</span>}
    </h3>
  );
}
