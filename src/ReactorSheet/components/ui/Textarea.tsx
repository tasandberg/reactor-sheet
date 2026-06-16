import { cx } from "./cx";
import type { TextareaHTMLAttributes } from "react";

export function Textarea({ invalid, className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea className={cx("textarea", invalid && "is-error", className)} {...rest} />;
}
