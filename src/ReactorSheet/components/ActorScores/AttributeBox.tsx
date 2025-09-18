import styled from "styled-components";
import { Text, TextTiny } from "../shared/elements";
import { colors } from "../shared/elements-vars";

const ScoreBox2 = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${colors.hint};
  color: var(--color-text-secondary);
  justify-content: start;
  align-items: center;
  padding: 4px;
  width: 45px;
  padding-bottom: 10px;
  border-radius: 4px;
  background: #222;
  position: relative;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.5);
`;

const ScoreBoxMod = styled.div`
  position: absolute;
  bottom: -10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #333;
  border: 1px solid ${colors.hint};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function AttributeBox({
  label,
  value,
  mod,
}: {
  label: string;
  value: number;
  fieldName: string;
  mod: string;
}) {
  return (
    <ScoreBox2>
      <TextTiny $color="label">{label}</TextTiny>
      <Text>{value}</Text>
      <ScoreBoxMod>
        <TextTiny $color="secondary">{mod}</TextTiny>
      </ScoreBoxMod>
    </ScoreBox2>
  );
}
