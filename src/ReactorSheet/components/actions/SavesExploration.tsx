import type { SaveVM, ExplorationVM } from "../../viewModels/types";
import { Table, Td, Tr } from "../ui/Table";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { saves: SaveVM[]; exploration: ExplorationVM[] };

/** Saving throws (roll-above) + exploration (1-in-6). Read-only. */
export function SavesExploration({ saves, exploration }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle hint="roll-above d20">Saving Throws</SectionTitle>
      <Table>
        <tbody>
          {saves.map((s) => (
            <Tr key={s.key}>
              <Td>
                <i className={s.icon} style={{ marginRight: 8, opacity: 0.7 }} />
                {s.label}
              </Td>
              <Td num>{s.target}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <SectionTitle hint="1-in-6">Exploration</SectionTitle>
      <Table>
        <tbody>
          {exploration.map((e) => (
            <Tr key={e.key}>
              <Td>
                <i className={e.icon} style={{ marginRight: 8, opacity: 0.7 }} />
                {e.label}
              </Td>
              <Td num>{e.inSix}-in-6</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
