import type { OSEActor } from "../types/types";
import HitPoints from "./HitPoints";

export default function ActorInfo({ actor }: { actor: OSEActor }) {
  // const { aac } = actor.system;
  const { title, alignment, class: cls, level, xp } = actor.system.details;

  return (
    <div className="actor-info mb-4 flex-row justify-between w-100 text-emphatic">
      <div className="flex-col gap-1">
        <h1 className="m-0">{actor.name}</h1>
        <div>
          <i>{title}</i>
        </div>
        <div>
          <strong>Level:</strong> {level}
        </div>
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
      <HitPoints actor={actor} />
      {/* <div className="stat-box ac-box flex-col gap-0 justify-start h-100 border-primary">
        <h5 className="m-0">AC</h5>
        <div className="stat-value">
          <h3 className="m-0">{aac.value}</h3>
        </div>
      </div> */}
    </div>
  );
}
