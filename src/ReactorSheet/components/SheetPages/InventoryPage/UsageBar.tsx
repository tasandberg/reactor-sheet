import type { OseItem } from "@src/ReactorSheet/types/types";
import styled from "styled-components";

const SegmentedProgressBar = styled.div<{
  segments: number;
  filledSegments: number;
}>`
  display: flex;
  gap: 2px;
  width: 100%;
  height: 10px;
  margin: 4px 0;
  overflow: hidden;
  cursor: pointer;

  & > div {
    flex: 1;
    background-color: #888;
    max-width: 5px;
    transition: background-color 0.3s;

    &:nth-child(-n + ${(props) => props.filledSegments}) {
      background-color: #4caf50;
    }
  }
`;

export default function UsageBar({ item }: { item: OseItem }) {
  const { value, max } = item.system.quantity;
  if (max === 0) return null;

  async function updateQuantity() {
    const newValue = Math.clamp(value - 1, 0, max);
    await item.update({ "system.quantity.value": newValue });
  }
  return (
    <div>
      <SegmentedProgressBar
        segments={max}
        filledSegments={value}
        onClick={updateQuantity}
        data-tooltip={`Click to consume. ${value}/${max} remaining.`}
      >
        {Array.from({ length: max }).map((_, idx) => (
          <div key={idx} />
        ))}
      </SegmentedProgressBar>
    </div>
  );
}
