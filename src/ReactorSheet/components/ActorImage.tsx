import styled from "styled-components";
import { useReactorSheetContext } from "./context";

const ActorImg = styled.img`
  @extend .bloody-box;
  width: 125px;
  height: 125px;
  border-radius: 10px;
  cursor: pointer;
  object-fit: cover;
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
