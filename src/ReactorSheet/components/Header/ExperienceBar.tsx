import type { OSEActor } from "@src/ReactorSheet/types/types";
import { Row, TextTiny } from "../shared/elements";
import { useState } from "react";

export default function ExperienceBar({ actor }: { actor: OSEActor }) {
  const [isEditing, setIsEditing] = useState(false);
  const [addXp, setAddXp] = useState(0);

  const toggleEditing = () => {
    setIsEditing(!isEditing);
    setAddXp(0);
  };

  const submitXp = async () => {
    const newXp = actor.system.details.xp.value + addXp;
    await actor.update({ "system.details.xp.value": newXp });
    toggleEditing();
  };

  return isEditing ? (
    <Row>
      <input
        type="number"
        placeholder="0"
        onChange={(e) => setAddXp(Number(e.target.value))}
        autoFocus
        style={{ width: "4rem" }}
        width="50px"
      />
      <button onClick={submitXp}>Add {addXp} XP</button>
    </Row>
  ) : (
    <Row $align="center" $justify="flex-start" className="w-100">
      <progress
        value={actor.system.details.xp.value}
        max={actor.system.details.xp.next}
        data-tooltip={`XP: ${actor.system.details.xp.value} / ${actor.system.details.xp.next}`}
      />
      <TextTiny>
        {actor.system.details.xp.value} / {actor.system.details.xp.next}
      </TextTiny>

      <TextTiny
        role="button"
        onClick={() => setIsEditing(true)}
        title="Edit XP"
      >
        <i className="fas fa-cog"></i>
      </TextTiny>
    </Row>
  );
}
