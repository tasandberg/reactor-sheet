import styled from "styled-components";

export const SectionHeader = styled.h4<{ $small?: boolean }>`
  font-size: 1.2rem;
`;

export const Badge = styled.span<{ $bg?: string }>`
  background-color: ${(props) =>
    props.$bg ? props.$bg : "var(--color-text-selection-bg)"};
  padding: 2px 3px;
  font-size: 0.75rem;
  border-radius: 4px;
`;
