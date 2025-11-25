import styled from "styled-components";
import { colors } from "../shared/elements-vars";

const GenericProgressBar = styled.div<{
  $percent?: number;
  $bg?: string;
  $fg?: string;
}>`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: ${(props) => props.$bg || colors.bgDark5};
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);

  .generic-progress-bar-fill {
    background-color: ${(props) => props.$fg || colors.bgDark6};
    height: 100%;
    width: ${(props) => (props.$percent ? props.$percent : 0)}%;
    transition: width 0.3s ease-in-out;
  }
`;

export default function GenericProgress({
  max,
  value,
  styles,
  fg,
  bg,
}: {
  max: number;
  value: number;
  styles?: React.CSSProperties;
  fg?: string;
  bg?: string;
}) {
  return (
    <GenericProgressBar
      $percent={Math.clamp(0, (value / max) * 100, 100)}
      style={styles}
      $fg={fg}
      $bg={bg}
    >
      <div className="generic-progress-bar-fill" />
    </GenericProgressBar>
  );
}
