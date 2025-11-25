import styled from "styled-components";
import { colors, fontSizes } from "../shared/elements-vars";
import { CharacterInputField } from "./shared-elements";

const CharacterInputContainer = styled.div<{ $fill: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  &:focus-within {
    border-color: ${colors.label};
  }

  position: relative;
  ${(props) => (props.$fill ? "width: 100%;" : "")}

  &:not(:last-child) .character-input-divider {
    content: "";
    position: absolute;
    bottom: -2px;
    height: 1px;
    width: 100%;
    background-color: ${colors.hint};
    opacity: 0.5;
  }
`;

const CharacterInputLabel = styled.label`
  padding: 6px 0px;
  color: ${colors.label};
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  font-size: ${fontSizes.xs};
  text-transform: uppercase;
  width: 65px;
  align-items: center;
  justify-content: start;
`;

const InputContainer = styled.div`
  line-height: 1.2;
  padding: 4px 8px;
  width: 100%;
  text-align: right;
`;

export default function CharacterInput({
  label,
  fill = false,
  renderInput,
  separator = true,
  focusBg,
  ...props
}: {
  label: string;
  fill?: boolean;
  renderInput?: React.ReactNode;
  separator?: boolean;
  focusBg?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">) {
  return (
    <CharacterInputContainer $fill={fill}>
      <CharacterInputLabel htmlFor={props.name}>{label}</CharacterInputLabel>
      {renderInput ? (
        <InputContainer>{renderInput}</InputContainer>
      ) : (
        <CharacterInputField
          {...props}
          id={props.name}
          autoCorrect="false"
          $focusBg={focusBg}
        />
      )}
      {separator && <div className="character-input-divider" />}
    </CharacterInputContainer>
  );
}
