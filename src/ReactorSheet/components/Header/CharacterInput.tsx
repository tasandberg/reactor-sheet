import styled from "styled-components";
import { colors, fontSizes } from "../shared/elements-vars";

const CharacterInputContainer = styled.div<{ $fill: boolean }>`
  display: flex;
  flex-direction: row;
  width: auto;
  box-sizing: border-box;
  &:focus-within {
    border-color: ${colors.label};
  }
  position: relative;
  ${(props) => (props.$fill ? "width: 100%;" : "")}

  &:not(:last-child) .character-input-divider {
    content: "";
    position: absolute;
    bottom: -1px;
    height: 1px;
    width: 100%;
    background-color: ${colors.border};
  }
`;

const CharacterInputLabel = styled.label`
  padding: 6px 0px;
  color: ${colors.hint};
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  font-size: ${fontSizes.sm};
  width: 80px;
  align-items: center;
  justify-content: start;
`;

const InputContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  line-height: 1.2;
  padding: 4px 8px;
`;

const CharacterInputField = styled.input`
  flex: 1;
  margin: 0px;
  border: none;
  font-size: ${fontSizes.sm};
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

export default function CharacterInput({
  label,
  fill = false,
  renderInput,
  separator = true,
  ...props
}: {
  label: string;
  fill?: boolean;
  renderInput?: React.ReactNode;
  separator?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">) {
  return (
    <CharacterInputContainer $fill={fill}>
      <CharacterInputLabel htmlFor={props.name}>{label}</CharacterInputLabel>
      {renderInput ? (
        <InputContainer>{renderInput}</InputContainer>
      ) : (
        <CharacterInputField {...props} autoCorrect="false" />
      )}
      {separator && <div className="character-input-divider" />}
    </CharacterInputContainer>
  );
}
