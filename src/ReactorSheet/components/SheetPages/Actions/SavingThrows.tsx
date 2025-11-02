import styled from "styled-components";
import { useReactorSheetContext } from "../../context";
import type { OSESave } from "@src/ReactorSheet/types/types";
import getLabel from "@src/util/getLabel";
import { TextSmall } from "../../shared/elements";
import ActionTable from "../Actions/ActionTable";
import type { GridTableColumn } from "../../shared/constants";
import { colors } from "../../shared/elements-vars";
import { useState, type SyntheticEvent } from "react";

const SaveInput = styled.input`
  background-color: ${colors.bgDark};
  border: 1px solid ${colors.hint};
  border-radius: 4px;
  text-align: center;
  width: 50px;
  height: 100%;
`;

type SavingThrowItem = {
  save: OSESave;
  value: number;
};

const icons = {
  breath: "fas fa-wind",
  death: "fas fa-skull-crossbones",
  paralysis: "fas fa-bolt",
  wand: "fas fa-magic",
  spell: "fas fa-hat-wizard",
};
export default function SavingThrows() {
  const { actor, updateActor } = useReactorSheetContext();
  const saves = actor.system.saves;
  const saveList: SavingThrowItem[] = [];
  for (const key in saves) {
    saveList.push({ save: key as OSESave, value: saves[key].value });
  }
  const [loading, setLoading] = useState(false);

  const updateSave = async (e: SyntheticEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    setLoading(true);
    await updateActor({ [name]: Number(value) }).finally(() =>
      setLoading(false)
    );
  };

  const columns: GridTableColumn<SavingThrowItem>[] = [
    {
      header: "",
      name: "save",
      justify: "start",
      align: "center",
      width: "1fr",
      renderCell: (item) => (
        <TextSmall $color="label">
          <i className={icons[item.save]} style={{ marginRight: "8px" }} />
          {getLabel(`OSE.saves.${item.save}.long`)}
        </TextSmall>
      ),
    },
    {
      header: "Roll above",
      name: "value",
      justify: "start",
      align: "center",
      renderCell: (item) => (
        <SaveInput
          defaultValue={item.value}
          name={`system.saves.${item.save}.value`}
          style={{ width: "50px", textAlign: "center" }}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            }
          }}
          onBlur={updateSave}
        />
      ),
    },
    {
      header: "",
      name: "action",
      justify: "start",
      align: "center",
      width: "50px",
      renderCell: (item) => (
        <button
          data-tooltip-text={`Roll ${getLabel(`OSE.saves.${item.save}.long`)}`}
          onClick={() =>
            actor.rollSave(item.save, {
              fastForward: false,
              chatMessage: "Teehee",
            })
          }
        >
          <i className="fas fa-dice-d20" />
        </button>
      ),
    },
  ];

  return (
    <ActionTable<SavingThrowItem>
      data={saveList}
      getRowId={(item) => item.save}
      title="Saving Throws"
      columns={columns}
      showHeader={false}
      columnRepeat={2}
    />
  );
}
