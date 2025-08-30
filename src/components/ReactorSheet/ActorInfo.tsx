import type { OSEActor } from "./types/types";

export default function ActorInfo({ actor }: { actor: OSEActor }) {
  const buildInfo = {
    name: actor.name,
    title: actor.system.details.title,
  };
  return (
    <div className="actor-info">
      <h2>Actor Info {actor.name}</h2>
    </div>
  );
}
