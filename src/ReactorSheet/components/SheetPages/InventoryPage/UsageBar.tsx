import styled from "styled-components";

const SegmentedProgressBar = styled.div<{
  $filledSegments: number;
}>`
  display: flex;
  gap: 2px;
  width: 100%;
  height: 7px;
  overflow: hidden;
  cursor: pointer;

  & > div {
    background-color: #888;
    width: 7px;
    flex-grow: 0;
    flex-shrink: 0;
    transition: background-color 0.3s;

    &:nth-child(-n + ${(props) => props.$filledSegments}) {
      background-color: #4caf50;
    }
  }
`;

export default function UsageBar({
  value,
  max,
  onClick,
}: {
  value: number;
  max: number;
  onClick?: () => void;
}) {
  return (
    <div>
      <SegmentedProgressBar
        $filledSegments={value}
        onClick={onClick}
        data-tooltip={`Click to consume. ${value}/${max} remaining.`}
      >
        {Array.from({ length: max }).map((_, idx) => (
          <div key={idx} />
        ))}
      </SegmentedProgressBar>
    </div>
  );
}
