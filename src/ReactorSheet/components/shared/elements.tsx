import styled from "styled-components";

/** Typography **/

const fontSizes = {
  tiny: "0.7rem",
  small: "0.85rem",
  medium: "1rem",
  large: "1.5rem",
  huge: "2rem",
};

const colors = {
  primary: "var(--color-text-primary)",
  secondary: "var(--color-text-secondary)",
  emphatic: "var(--color-text-emphatic)",
  highlight: "var(--color-text-highlight)",
};

const fontFamily = {
  sans: "var(--font-sans)",
  serif: "var(--font-serif)",
};

export const Text = styled.span<{
  $size?: "small" | "medium" | "large";
  $color?: keyof typeof colors;
}>`
  font-size: ${({ $size }) => ($size ? fontSizes[$size] : fontSizes.medium)};
  font-family: ${fontFamily.sans};
  color: ${({ $color }) => ($color ? colors[$color] : colors.primary)};
`;

export const TextTiny = styled(Text)`
  font-size: ${fontSizes.tiny};
`;

export const TextSmall = styled(Text)`
  font-size: ${fontSizes.small};
`;

export const TextLarge = styled(Text)`
  font-size: ${fontSizes.large};
`;
export const TextHuge = styled(Text)`
  font-size: ${fontSizes.huge};
`;

export const TextEmphatic = styled(Text)`
  font-size: ${fontSizes.medium};
  font-weight: bold;
  color: ${colors.emphatic};
`;

export const H1 = styled.h1`
  font-size: ${fontSizes.huge};
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
}>`
  display: flex;
  flex-direction: ${(props) => (props.$dir ? props.$dir : "row")};
  gap: 0.5rem;
  align-items: ${(props) => (props.$align ? props.$align : "center")};
  justify-content: ${(props) =>
    props.$justify ? props.$justify : "flex-start"};
`;

export const Row = styled(Flex)`
  flex-direction: row;
`;

export const Column = styled(Flex)`
  flex-direction: column;
`;
