import { SectionTitle } from "./SectionTitle";

export default { title: "Layout / SectionTitle" };

export const WithHint = () => (
  <SectionTitle hint="3 prepared">Spells</SectionTitle>
);

export const WithoutHint = () => <SectionTitle>Inventory</SectionTitle>;
