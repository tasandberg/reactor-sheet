import { useState } from "react";
import type { OseSpell } from "@src/ReactorSheet/types/types";
import {
  IncrementButton,
  Row,
  Text,
  TextSmall,
  TextTiny,
} from "../../shared/elements";
import ActionTable from "../Actions/ActionTable";
import { useSpellColumns } from "./useSpellColumns";
import { clsx } from "clsx";

export default function SpellbookLevel({
  level,
  slots,
  spells,
  updateSlots,
}: {
  level: number;
  slots: { used: number; max: number };
  spells: OseSpell[];
  updateSlots?: (level: number, max: number) => Promise<void>;
}) {
  const [editing, isEditing] = useState<boolean>(false);
  return (
    <div
      style={{
        borderRadius: "4px",
      }}
    >
      <Row
        $justify="space-between"
        $align="center"
        $gap={"none"}
        className="pl-2 pr-2"
      >
        <Text>Level {level}</Text>
        <div className="flex-row gap-2 align-center">
          <TextSmall>
            {editing
              ? `Max slots: ${slots.max}`
              : `Slots: ${slots.used}/${slots.max}`}
          </TextSmall>
          <div className="flex-row align-center gap-1">
            {editing && (
              <>
                <IncrementButton
                  onClick={async () => await updateSlots(level, slots.max - 1)}
                >
                  -
                </IncrementButton>
                <IncrementButton
                  onClick={async () => await updateSlots(level, slots.max + 1)}
                >
                  +
                </IncrementButton>
              </>
            )}
            <TextTiny
              role="button"
              data-tooltip={editing ? "Save Changes" : "Edit spell slots"}
              onClick={() => isEditing(!editing)}
            >
              <i
                className={clsx("fas", {
                  "fa-cog": !editing,
                  "fa-save": editing,
                })}
              />
            </TextTiny>
          </div>
        </div>
      </Row>
      <div className="p-2 pb-3">
        <ActionTable<OseSpell>
          data={spells || []}
          columns={useSpellColumns({
            deleteable: true,
            showMemorize: true,
          })}
          showHeader={false}
          getRowId={(item) => item._id as string}
        />
      </div>
    </div>
  );
}
