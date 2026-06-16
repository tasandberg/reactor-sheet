import { Table, Th, Td, Tr } from "./Table";
import { Stamp } from "./Stamp";

export default { title: "Data / Table" };

export const Weapons = () => (
  <Table>
    <thead>
      <Tr>
        <Th><Stamp>Weapon</Stamp></Th>
        <Th><Stamp>Damage</Stamp></Th>
        <Th num><Stamp>Atk</Stamp></Th>
      </Tr>
    </thead>
    <tbody>
      <Tr>
        <Td>Longsword</Td>
        <Td>1d8</Td>
        <Td num>+5</Td>
      </Tr>
      <Tr>
        <Td>Dagger</Td>
        <Td>1d4</Td>
        <Td num>+3</Td>
      </Tr>
    </tbody>
  </Table>
);
