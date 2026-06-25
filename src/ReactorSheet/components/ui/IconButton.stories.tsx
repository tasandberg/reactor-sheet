import { IconButton } from "./IconButton";

export default { title: "Controls / IconButton" };

export const Variants = () => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
    <IconButton title="Default" aria-label="Default">
      <i className="fa-solid fa-pen" aria-hidden="true" />
    </IconButton>
    <IconButton variant="danger" title="Delete" aria-label="Delete">
      <i className="fa-solid fa-trash" aria-hidden="true" />
    </IconButton>
    <IconButton variant="accent" title="Add" aria-label="Add">
      <i className="fa-solid fa-plus" aria-hidden="true" />
    </IconButton>
    <IconButton variant="accent" on title="Editing" aria-label="Editing">
      <i className="fa-solid fa-check" aria-hidden="true" />
    </IconButton>
    <IconButton variant="round" title="Add language" aria-label="Add language">
      <i className="fa-solid fa-plus" aria-hidden="true" />
    </IconButton>
    <IconButton size="sm" variant="danger" title="Remove" aria-label="Remove">
      <i className="fa-solid fa-xmark" aria-hidden="true" />
    </IconButton>
    <IconButton disabled title="Disabled" aria-label="Disabled">
      <i className="fa-solid fa-plus" aria-hidden="true" />
    </IconButton>
  </div>
);
