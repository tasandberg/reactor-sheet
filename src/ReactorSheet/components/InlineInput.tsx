import styled from "styled-components";

/**
 * A component that displays text as normal but
 * turns into an input field when clicked on.
 */
export const InlineInput = styled.input<{ $outline?: boolean }>`
  height: fit-content;

  &:not(:focus) {
    cursor: pointer;
    border: ${(props) => (props.$outline ? "inherit" : "none")};
    color: inherit;
    background: transparent;
    padding-left: 0;
    margin: 0;
  }
`;
