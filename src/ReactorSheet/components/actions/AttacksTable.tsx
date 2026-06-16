import type { AttackVM } from "../../viewModels/types";
import { Table, Th, Td, Tr } from "../ui/Table";
import { Tag } from "../ui/Tag";
import { SectionTitle } from "../ui/SectionTitle";

type Props = { attacks: AttackVM[] };

/** Equipped-weapon attacks table. Read-only (rollWeapon is later). */
export function AttacksTable({ attacks }: Props) {
  return (
    <section className="rs-section">
      <SectionTitle hint="hit · damage">Attacks</SectionTitle>
      <Table>
        <thead>
          <Tr>
            <Th>Item</Th>
            <Th num>Hit</Th>
            <Th num>Damage</Th>
          </Tr>
        </thead>
        <tbody>
          {attacks.map((a) => (
            <Tr key={a.id}>
              <Td>
                <div className="rs-weapon">
                  {a.img && <img src={a.img} alt={a.name} />}
                  <div>
                    <div className="wname">
                      {a.name} <span style={{ opacity: 0.6 }}>({a.kind})</span>
                    </div>
                    <div className="rs-quals">
                      <Tag intent={a.kind === "melee" ? "mustard" : "teal"}>{a.kindLabel}</Tag>
                      {a.qualities.map((q) => (
                        <Tag key={q}>{q}</Tag>
                      ))}
                    </div>
                  </div>
                </div>
              </Td>
              <Td num>{a.hitLabel}</Td>
              <Td num>{a.damage}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </section>
  );
}
