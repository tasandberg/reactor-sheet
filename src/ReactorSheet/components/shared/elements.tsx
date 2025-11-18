import styled from "styled-components";
import { colors, fontFamily, fontSizes, spacer } from "./elements-vars";

/** Typography **/
export const Text = styled.span<{
  $size?: keyof typeof fontSizes;
  $color?: keyof typeof colors;
}>`
  font-size: ${({ $size }) => ($size ? fontSizes[$size] : fontSizes.md)};
  font-family: ${fontFamily.sans};
  color: ${({ $color }) => ($color ? colors[$color] : colors.primary)};
`;

export const TextTiny = styled(Text)`
  font-size: ${fontSizes.xs};
`;

export const TextSmall = styled(Text)`
  font-size: ${fontSizes.sm};
`;

export const TextLarge = styled(Text)`
  font-size: ${fontSizes.lg};
`;
export const TextHuge = styled(Text)`
  font-size: ${fontSizes.xl};
`;

export const TextEmphatic = styled(Text)`
  font-size: ${fontSizes.md};
  font-weight: bold;
  color: ${colors.emphatic};
`;

export const H1 = styled.h1`
  font-size: ${fontSizes.xl};
  color: ${colors.primary};
  font-family: ${fontFamily.serif};
`;

export const SectionHeader = styled.h4<{ $small?: boolean; $fw?: string }>`
  font-size: 1.2rem;
  font-weight: ${(props) => (props.$fw ? props.$fw : "bold")};
`;

export const Badge = styled.span<{ $bg?: string }>`
  background-color: ${(props) =>
    props.$bg ? props.$bg : "var(--color-text-selection-bg)"};
  padding: 2px 3px;
  font-size: 0.75rem;
  border-radius: 4px;
`;

export const Flex = styled.div<{
  $dir?: string;
  $align?: string;
  $justify?: string;
  $gap?: keyof typeof spacer;
  $wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${(props) => (props.$dir ? props.$dir : "row")};
  gap: ${(props) => (props.$gap ? spacer[props.$gap] : spacer.sm)};
  align-items: ${(props) => (props.$align ? props.$align : "center")};
  justify-content: ${(props) =>
    props.$justify ? props.$justify : "flex-start"};
  width: 100%;
  flex-wrap: ${(props) => (props.$wrap ? "wrap" : "nowrap")};
`;

export const Row = styled(Flex)`
  flex-direction: row;
`;

export const Column = styled(Flex)`
  flex-direction: column;
`;

// Components
export const ActionHeader = styled.div`
  padding: ${spacer.xs} 0;
  margin-bottom: ${spacer.sm};
  width: 100%;
`;

export const IncrementButton = styled.button`
  min-width: 20px;
  min-height: 20px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 100%;
  font-size: 0.75rem;
  padding: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
