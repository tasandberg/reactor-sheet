import { Card, KvCard } from "./Card";
import { Stamp } from "./Stamp";

export default { title: "Layout / Card" };

export const Basic = () => (
  <Card>
    <p>A parchment card holds grouped content — descriptions, lists, or any sheet section.</p>
  </Card>
);

export const KeyValue = () => (
  <KvCard>
    <div className="head">
      <Stamp>STR</Stamp>
    </div>
    <div className="val">16</div>
  </KvCard>
);
