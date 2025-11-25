import styled from "styled-components";
import { colors } from "./elements-vars";

export const ProgressBar = styled.div<{ $percentage: number; $color?: string }>`
  width: 100%;
  height: 100%;
  max-width: 200px;
  position: relative;
  border-radius: 25px;
  box-sizing: border-box;
  background: ${colors.bgDark3};
  border: 0.5px solid black;
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 0 8px;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
    box-shadow: inset 0 0 7px rgba(0, 0, 0, 0.5);
    border: 1px solid #000;
    box-sizing: border-box;
    left: ${(props) => props.$percentage - 100}%;
    width: 100%;
    height: 100%;
    border-radius: 25px;
    background-image: linear-gradient(
      to right,
      black -50%,
      ${(props) => props.$color || "green"} 100%
    );
    pointer-events: none;
    transition: left 0.3s ease-in-out;
  }

  span {
    position: relative;
    color: var(--color-text-emphatic);
    letter-spacing: -0.8px;
  }
`;
