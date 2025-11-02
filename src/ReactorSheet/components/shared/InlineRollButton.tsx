export const InlineRollButton = ({
  formula,
  flavor,
  children,
}: {
  formula: string;
  flavor: string;
  children: React.ReactNode;
}) => (
  <a
    className="inline-roll roll"
    data-mode="roll"
    data-formula={formula}
    data-tooltip-text={formula}
    data-flavor={flavor}
    style={{
      background: "none",
      border: "none",
      padding: 0,
      width: "100%",
    }}
  >
    {children}
  </a>
);
