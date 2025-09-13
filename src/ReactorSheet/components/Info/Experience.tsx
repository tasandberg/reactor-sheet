import styled from "styled-components";
import { useReactorSheetContext } from "../context";

const ProgressBar = styled.progress`
  width: 100%;
  height: 1.5rem;
  border-radius: 0.25rem;
`;

export default function Experience() {
  const { actor } = useReactorSheetContext();
  const { xp } = actor.system.details;
  return (
    <div style={{ marginTop: "1rem" }}>
      <strong>Experience:</strong>
      <ProgressBar value={xp.value} max={xp.next} />
    </div>
  );
}
