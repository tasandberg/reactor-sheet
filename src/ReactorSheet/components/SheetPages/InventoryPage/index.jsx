import { useReactorSheetContext } from "../../context";
import Encumbrance from "../../Encumbrance";
import { SectionHeader } from "../../shared/elements";
import { toggleExpand } from "../../shared/expandable";
import ItemTable from "./ItemTable";
import Money from "./Money";
import UsageBar from "./UsageBar";

export default function InventoryPage() {
  const { items, actor } = useReactorSheetContext();
  console.log(items[0].system.quantity);
  const categorizedItems = items.reduce((acc, item) => {
    const category = item.type || "uncategorized";
    if (!["weapon", "armor", "item", "treasure"].includes(category)) {
      return acc; // Skip items that are not weapon, armor, or gear
    }
    if (item.system.tags.find((t) => t.value === "Currency")) {
      return acc; // Skip currency items
    }
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const handleEquip = (item, event) => {
    console.log("hi. equipped", item);
    item.update({ "system.equipped": event.target.checked });
  };

  const columns = [
    {
      name: "",
      getCell: (item) => (
        <img
          src={item.img}
          alt={item.name}
          width={45}
          style={{ flexGrow: 0, flexShrink: 0 }}
        />
      ),
      showHeader: false,
      classes: "p-0",
      align: "left",
    },
    {
      name: "Name",
      getValue: (item) => item.name,
      getCell: (item) => (
        <div className="flex-col gap-0">
          <a onClick={() => item.sheet.render(true)}>{item.name}</a>
          <UsageBar item={item} />
        </div>
      ),
      align: "left",
      sortable: true,
    },
    {
      name: "Weight",
      sortable: true,
      getValue: (item) => item.cumulativeWeight,
    },
    {
      name: "Qty",
      sortable: true,
      getValue: (item) => item.system?.quantity?.value || "",
    },
    {
      name: "Equipped",
      sortable: true,
      getValue: (item) =>
        item.system.hasOwnProperty("equipped") && item.system?.equipped ? 1 : 0,
      getCell: (item) =>
        item.system.hasOwnProperty("equipped") ? (
          <input
            type="checkbox"
            defaultChecked={item.system?.equipped || false}
            onChange={(event) => handleEquip(item, event)}
          />
        ) : (
          ""
        ),
    },
    {
      name: "Delete",
      showHeader: false,
      sortable: false,
      getCell: (item) => (
        <a className="item-control item-show" onClick={() => item.delete()}>
          <i className="fas fa-trash"></i>
        </a>
      ),
    },
  ];
  return (
    <div className="flex-col">
      <div>
        {Object.entries(categorizedItems).map(([category, items]) => (
          <div key={category}>
            <SectionHeader
              className="expandable expanded"
              onClick={toggleExpand}
            >
              {category}
            </SectionHeader>
            <div>
              <ItemTable columns={columns} items={items} />
            </div>
          </div>
        ))}
      </div>
      <Money actor={actor} />
      <Encumbrance />
    </div>
  );
}
