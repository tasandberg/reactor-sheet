import ArmorClass from "../ArmorClass";
import Encumbrance from "../Encumbrance";
import { InlineInput } from "../InlineInput";
import { useReactorSheetContext } from "../context";

export default function ActorInfo() {
  const { actor, updateActor } = useReactorSheetContext();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    updateActor({ [name]: value });
  };

  return (
    <div className="actor-info mb-4 flex-row text-emphatic gap-0">
      <div className="flex-col gap-0">
        <h1 className="mb-1">
          <InlineInput
            type="text"
            name="name"
            placeholder="Character Name"
            defaultValue={actor.name}
            onBlur={handleChange}
          />
        </h1>
        <h5 className="m-0">
          {actor.system.details.class} {actor.system.details.level}
        </h5>
        <Encumbrance />
      </div>
      <ArmorClass />
    </div>
  );
}
