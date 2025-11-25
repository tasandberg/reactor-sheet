import styled from "styled-components";
import { useReactorSheetContext } from "../context";

const ActorImg = styled.img`
  width: 100%;
  border-radius: 4px;
  cursor: pointer;
  box-sizing: border-box;
`;

const ActorImgFrame = styled.div`
  width: 100%;
  border-radius: 8px;
  box-sizing: border-box;
  border: 1px solid #222;
  &:hover {
    border-color: var(--color-text-secondary);
  }
`;

export default function ActorImage() {
  const { actor } = useReactorSheetContext();

  return (
    <ActorImgFrame>
      <ActorImg
        src={String(actor.img)}
        data-action="editImage"
        data-edit="img"
        className="profile-img"
        alt={actor.name}
      />
    </ActorImgFrame>
  );
}
