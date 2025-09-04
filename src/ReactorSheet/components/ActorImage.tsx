import styled from "styled-components";
import { useReactorSheetContext } from "./context";

const ActorImg = styled.img`
  @extend .bloody-box;
  width: 130px;
  height: 130px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1rem;
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
