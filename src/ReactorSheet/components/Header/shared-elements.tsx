import styled from "styled-components";
import { colors, fontSizes } from "../shared/elements-vars";

export const CharacterInputField = styled.input<{
  $fontSize?: string;
  $focusBg?: string;
}>`
  flex: 1;
  margin: 0px;
  border: none;
  font-size: ${(props) => props.$fontSize || fontSizes.sm};
  padding: 4px 8px;
  border-radius: 4px;
  margin: 0;
  border-radius: 0;
  background-color: transparent;
  color: ${colors.emphatic};
  width: 100%;
  outline: none;
  display: flex;
  align-items: center;
  line-height: 1.2;
  height: calc(16px * 1.2);

  &[type="number"] {
    height: calc(16px * 1.2);
  }

  &:focus {
    background-color: ${(props) => props.$focusBg || colors.bgDark3};
    border-color: ${colors.label};
  }

  &:disabled {
    color: ${colors.label};
  }
`;
