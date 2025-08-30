import type { OSEActor } from "../types/types";

export default function ActorInfo({ actor }: { actor: OSEActor }) {
  const { aac } = actor.system;
  const { title, alignment, class: cls, level, xp } = actor.system.details;

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
      <div className="stat-box hp-box flex-col align-center justify-start">
        <h5 className="mb-1">HP</h5>
        <div className="stat-value">
          <span className="main">{actor.system.hp.value}</span>
          <span className="max">/{actor.system.hp.max}</span>
        </div>
      </div>
      <div className="stat-box ac-box flex-col align-center justify-start">
        <h5 className="mb-1">AC</h5>
        <div className="stat-value">
          <span className="main">{aac.value}</span>
        </div>
      </div>
    </div>
  );
}
