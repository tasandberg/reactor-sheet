import styled from "styled-components";
import { useReactorSheetContext } from "./context";

const ActorImg = styled.img`
  @extend .bloody-box;
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
`;

export default function ActorImage() {
  const { actor } = useReactorSheetContext();

  return (
    <ActorImg
      src={String(actor.img)}
      data-action="editImage"
      data-edit="img"
      alt={actor.name}
    />
  );
}
