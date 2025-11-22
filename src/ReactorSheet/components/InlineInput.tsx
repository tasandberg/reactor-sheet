import styled from "styled-components";

/**
 * A component that displays text as normal but
 * turns into an input field when clicked on.
 */
export const InlineInput = styled.input<{ $outline?: boolean }>`
  width: 100%;
  font-size: inherit;
  font-family: inherit;
  line-height: 1.2;
  margin: 0;
  &:focus {
    margin: 0;
    border: none;
  }

  &:not(:focus) {
    cursor: pointer;
    border: ${(props) => (props.$outline ? "inherit" : "none")};
    color: inherit;
    background: transparent;
    margin: 0;
  }
`;
