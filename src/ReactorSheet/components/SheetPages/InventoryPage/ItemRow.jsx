export default function ItemRow({ item }) {
  const { cost, equipped, tags, quantity, treasure, weight } = item.system;
  console.log(item);
  return (
    <div className="flex-col gap-0 item-row">
      <div className="flex-row gap-1 align-center">
        <div className="item-row-img">
          <img src={item.img} alt={item.name} width={35} height={35} />
        </div>
        <span className="item-name">{item.name}</span>
        {quantity && <span className="item-quantity">{quantity.value}</span>}
        <span className="item-weight">{item.cumulativeWeight}</span>
      </div>
    </div>
  );
}
