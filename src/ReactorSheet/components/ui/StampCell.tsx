import { cx } from "./cx";
import { NumberInput } from "./NumberInput";
import { OverrideValue } from "./OverrideValue";
import type { ReactNode } from "react";

/** @category Display/Controls — ink-stamp numeric cell. Ink key over a centered
 *  mono number input over a mono caption. Used for abilities and saves. */
export function StampCell({
  stampKey,
  fullName,
  value,
  onChange,
  min,
  max,
  caption,
  overridden,
  onResetRequest,
}: {
  stampKey: string;
  fullName?: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  caption: ReactNode;
  overridden?: boolean;
  onResetRequest?: () => void;
}) {
  return (
    <div className={cx("ed-cell", overridden && "ovr")}>
      <span className="ck" title={fullName} aria-label={fullName}>{stampKey}</span>
      <NumberInput className="num" value={value} min={min} max={max} onCommit={onChange} />
      {onResetRequest != null ? (
        <OverrideValue
          overridden={!!overridden}
          defaultText={caption}
          onResetRequest={onResetRequest}
          align="center"
          className="cm"
        />
      ) : (
        <span className="cm">{caption}</span>
      )}
    </div>
  );
}
