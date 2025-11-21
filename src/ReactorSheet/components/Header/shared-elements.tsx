import styled from "styled-components";
import { colors, fontSizes } from "../shared/elements-vars";

export const CharacterInputField = styled.input<{ $fontSize?: string }>`
  flex: 1;
  margin: 0px;
  border: none;
  font-size: ${(props) => props.$fontSize || fontSizes.sm};
  padding: 4px 8px;
  border-radius: 0;
  margin: 0;
  border-radius: 0;
  background-color: transparent;
  color: ${colors.emphatic};
  width: 100%;
  outline: none;
  display: flex;
  align-items: center;
  line-height: 1.2;

  &:focus {
    background-color: ${colors.bgDark3};
    border-color: ${colors.label};
  }
`;
