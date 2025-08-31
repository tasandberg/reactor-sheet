import type { OSEActor } from "../types/types";

export default function ActorInfo({ actor }: { actor: OSEActor }) {
  const { aac } = actor.system;
  const { title, alignment, class: cls, level, xp } = actor.system.details;
  console.log("ActorInfo render", xp.value);
  return (
    <div className="actor-info mb-4 flex-row justify-between w-100">
      <div className="flex-col gap-1">
        <h1 className="m-0">{actor.name}</h1>
        <h6 className="m-0 text-secondary">
          Level {level} {title}
        </h6>
        <div>
          <strong>Class:</strong> {cls}
        </div>
        <div>
          <strong>XP:</strong> {xp.value} / {xp.next}
        </div>
        <div>
          <strong>Alignment:</strong> {alignment}
        </div>
      </div>
      <div className="stat-box hp-box flex-col gap-0 border-danger">
        <h5 className="m-0">HP</h5>
        <div className="stat-value flex-col gap-0">
          <h3 className="m-0">{actor.system.hp.value}</h3>
        </div>
      </div>
      <div className="stat-box ac-box flex-col gap-0 justify-start h-100 border-primary">
        <h5 className="m-0">AC</h5>
        <div className="stat-value">
          <h3 className="m-0">{aac.value}</h3>
        </div>
      </div>
    </div>
  );
}
