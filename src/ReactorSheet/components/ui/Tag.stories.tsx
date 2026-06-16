import { Tag } from "./Tag";

export default { title: "Display / Tag" };

export const Intents = () => (
  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
    <Tag>Neutral</Tag>
    <Tag intent="teal">Teal</Tag>
    <Tag intent="crimson">Crimson</Tag>
    <Tag intent="forest">Forest</Tag>
    <Tag intent="mustard">Mustard</Tag>
    <Tag intent="solid">Solid</Tag>
  </div>
);
