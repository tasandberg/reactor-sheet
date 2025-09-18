import styled from "styled-components";

export const ProgressBar = styled.div<{ $percentage: number; $color?: string }>`
  width: 100%;
  height: 25px;
  max-width: 200px;
  position: relative;
  border-radius: 25px;
  box-shadow: inset 0 0 7px #000000;
  background: #222;
  border: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: start;
  padding: 0 8px;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    top: 0;
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
    text-shadow: 0 0 3px goldenrod;
    letter-spacing: -0.8px;
  }
`;
