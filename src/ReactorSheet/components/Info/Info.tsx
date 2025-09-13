import ActorImage from "../ActorImage";

export default function Info() {
  return (
    <div
      style={{
        gridArea: "info",
        width: 228,
        padding: "1rem",
        overflow: "hidden auto",
      }}
    >
      <div className="flex-col">
        <ActorImage />
      </div>
    </div>
  );
}
