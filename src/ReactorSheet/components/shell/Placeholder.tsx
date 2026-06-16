type Props = { label: string; hint?: string };

/** Labeled dashed box marking a chrome region built in a later phase. */
export function Placeholder({ label, hint }: Props) {
  return (
    <div className="rs-placeholder" role="presentation">
      <span className="rs-ph-label">{label}</span>
      {hint && <span className="rs-ph-hint">{hint}</span>}
    </div>
  );
}
