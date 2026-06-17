import { useState } from "react";
import type { InventoryVM, EncumbranceVM, InventoryItemVM } from "../../viewModels/types";
import { SectionTitle } from "../ui/SectionTitle";
import { Check } from "../ui/Check";
import { cx } from "../ui/cx";

type Ops = { onEquip: (id: string) => void; onOpen: (id: string) => void };
type Props = { inventory: InventoryVM; encumbrance: EncumbranceVM } & Ops;

const weightLabel = (w: number) => (w > 0 ? `${w} cn` : "—");
// Weapon damage (e.g. "1d4") for the card badge; else the qty/charges.
const cardBadge = (item: InventoryItemVM) =>
  item.meta.match(/^\d*d\d+/)?.[0] ?? (item.quantity ? `${item.quantity.value}/${item.quantity.max}` : "");

function EncumbranceBar({ e }: { e: EncumbranceVM }) {
  return (
    <div className="rs-enc">
      <div className="rs-enc-top">
        <span className="rs-enc-l">
          Encumbrance <b>{e.value}</b> / <b>{e.max}</b> cn
        </span>
        <span className="rs-enc-r">
          {e.status} · {e.move}′
        </span>
      </div>
      <div className="rs-enc-track">
        <div className="rs-enc-fill" style={{ width: `${Math.round(e.pct * 100)}%` }} />
      </div>
    </div>
  );
}

function InvRow({ item, onEquip, onOpen }: { item: InventoryItemVM } & Ops) {
  return (
    <div className="rs-inv-row">
      {item.equipped === null ? (
        <span className="rs-inv-equip-spacer" />
      ) : (
        <Check
          className="rs-inv-equip"
          checked={item.equipped}
          onChange={() => onEquip(item.id)}
          aria-label={item.equipped ? "Unequip" : "Equip"}
        />
      )}
      <button type="button" className="rs-inv-name" onClick={() => onOpen(item.id)}>
        <span className="nm">{item.name}</span>
        {item.quantity && <span className="qty">×{item.quantity.value}</span>}
        {item.meta && <span className="meta">{item.meta}</span>}
      </button>
      <span className="rs-inv-wt">{weightLabel(item.weight)}</span>
    </div>
  );
}

function InvCard({ item, onEquip, onOpen }: { item: InventoryItemVM } & Ops) {
  const badge = cardBadge(item);
  return (
    <div className="rs-inv-card">
      <div className="rs-inv-cardtile">
        <button type="button" className="rs-inv-cardbtn" onClick={() => onOpen(item.id)} aria-label={item.name}>
          {item.img ? <img src={item.img} alt="" /> : <span className="mono">{item.monogram}</span>}
        </button>
        {item.equipped !== null && (
          <button
            type="button"
            className={cx("rs-inv-cardeq", item.equipped && "on")}
            onClick={() => onEquip(item.id)}
            aria-label={item.equipped ? "Unequip" : "Equip"}
          >
            <i className="fa-solid fa-check" aria-hidden="true" />
          </button>
        )}
        {badge && <span className="rs-inv-cardbadge">{badge}</span>}
      </div>
      <span className="rs-inv-cardname">{item.name}</span>
    </div>
  );
}

export function InventoryView({ inventory, encumbrance, onEquip, onOpen }: Props) {
  const [view, setView] = useState<"list" | "grid">("list");
  return (
    <section className="rs-inv">
      <div className="rs-inv-head">
        <SectionTitle hint="equip weapons &amp; armour to bring them into play">Inventory</SectionTitle>
        <div className="rs-inv-toggle" role="group" aria-label="View">
          <button
            type="button"
            className={cx("rs-inv-vbtn", view === "list" && "active")}
            aria-label="List view"
            onClick={() => setView("list")}
          >
            <i className="fa-solid fa-list" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cx("rs-inv-vbtn", view === "grid" && "active")}
            aria-label="Grid view"
            onClick={() => setView("grid")}
          >
            <i className="fa-solid fa-table-cells-large" aria-hidden="true" />
          </button>
        </div>
      </div>

      {encumbrance.enabled && <EncumbranceBar e={encumbrance} />}

      {inventory.groups.map((g) => (
        <div key={g.key} className="rs-inv-group">
          <div className="rs-inv-cat">{g.label}</div>
          {view === "list" ? (
            g.items.map((it) => <InvRow key={it.id} item={it} onEquip={onEquip} onOpen={onOpen} />)
          ) : (
            <div className="rs-inv-cards">
              {g.items.map((it) => (
                <InvCard key={it.id} item={it} onEquip={onEquip} onOpen={onOpen} />
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
