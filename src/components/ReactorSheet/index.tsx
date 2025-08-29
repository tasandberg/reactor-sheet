import type { ReactorSheetAppProps } from "./types";

const ReactorSheetApp: React.FC<ReactorSheetAppProps> = ({
  actor,
}: ReactorSheetAppProps) => {
  return (
    <div className="container">
      <h1>Greetings</h1>
      {actor ? <p>Actor: {actor.name}</p> : <p>No actor provided.</p>}
    </div>
  );
};

export default ReactorSheetApp;
