export default function Wealth({ items }) {
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
      name: "Currency",
      getValue: (item) => item.name,
    },
  ];

  return (
    <div className="flex-col gap-1">
      <h4>Wealth</h4>
      <div>
        <ItemTable columns={columns} />
      </div>
    </div>
  );
}
