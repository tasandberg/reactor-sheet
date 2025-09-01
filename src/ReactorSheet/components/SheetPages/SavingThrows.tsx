import styled from "styled-components";
import { useReactorSheetContext } from "../context";
import type { OSESave } from "@src/ReactorSheet/types/types";
import getLabel from "@src/util/getLabel";
import { SectionHeader } from "../shared/elements";
import { Fragment } from "react";

const SavingThrowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, max-content);
`;

const SavingThrowButton = styled.a`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;

  &:hover {
    background-color: var(--color-primary-dark);
  }
`;

const SavingThrowLabel = styled.div`
  color: var(--color-text-secondary);
  font-family: var(--font-h1);
  letter-spacing: 0.9px;
  font-size: 1rem;
  font-weight: bold;
  flex-grow: 1;
`;

const SavingThrowValue = styled.div`
  flex-grow: 0;
`;
export default function SavingThrows() {
  const { actor } = useReactorSheetContext();
  const saves = actor.system.saves;
  const saveList: { save: OSESave; value: number }[] = [];
  for (const key in saves) {
    saveList.push({ save: key as OSESave, value: saves[key].value });
  }

  return (
    <div>
      <SectionHeader>Saving Throws</SectionHeader>
      <SavingThrowGrid>
        {saveList.map(({ save, value }) => (
          <Fragment key={`st-${save}`}>
            <SavingThrowButton
              role="button"
              className="bloody-box"
              onClick={() =>
                actor.rollSave(save, {
                  fastForward: true,
                  chatMessage: "Teehee",
                })
              }
            >
              <div className="flex-row align-center justify-between w-100">
                <SavingThrowLabel>
                  {getLabel(`OSE.saves.${save}.long`)}:
                </SavingThrowLabel>
                <SavingThrowValue>{value}</SavingThrowValue>
              </div>
            </SavingThrowButton>
          </Fragment>
        ))}
      </SavingThrowGrid>
    </div>
  );
}
