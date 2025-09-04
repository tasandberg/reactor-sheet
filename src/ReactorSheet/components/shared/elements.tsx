import styled from "styled-components";

export const SectionHeader = styled.h4<{ $small?: boolean; $fw?: string }>`
  font-size: 1.2rem;
  font-weight: ${(props) => (props.$fw ? props.$fw : "bold")};
`;
