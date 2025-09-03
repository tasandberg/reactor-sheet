import styled from "styled-components";

/**
 * A component that displays text as normal but
 * turns into an input field when clicked on.
 */
export const InlineInput = styled.input`
  height: fit-content;
  &:not(:focus) {
    cursor: pointer;
    border: none;
    color: inherit;
    background: transparent;
    padding-left: 0;
    margin: 0;
  }
`;
