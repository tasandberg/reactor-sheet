export default function RestButtons() {
  return (
    <div className="flex-col" style={{ minWidth: "170px" }}>
      <div className="flex-row"></div>
      <div className="flex-row">
        <a
          className="button inline-roll roll w-100"
          data-mode="roll"
          data-formula="1d3"
          data-flavor="Long Rest HP recovery"
          title="Long rest is a full 24-hour rest, restoring 1d3 hit points."
          data-tooltip="Long rest is a full 24-hour rest, restoring 1d3 hit points."
        >
          <i className="fa-solid fa-campground mr-1"></i>Rest
        </a>
        <a
          className="button inline-roll w-100"
          title="Short Rest"
          data-tooltip="Re-memorize all spells (not implemented)"
          onClick={() => alert("Not implemented")}
        >
          <i className="fa-solid fa-book mr-1"></i>Study
        </a>
      </div>
    </div>
  );
}
