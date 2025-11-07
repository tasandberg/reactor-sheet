import ActorImage from "./ActorImage";
import { Column } from "../shared/elements";
import { colors } from "../shared/elements-vars";
import ACShield from "./ACShield";
import ActorInfo from "./ActorInfo";

export default function Header() {
  return (
    <header
      style={{
        backgroundColor: "#222",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
        borderBottom: "0.5px solid #444",
        position: "relative",
        zIndex: 2,
        display: "flex",
        width: "100%",
      }}
    >
      <div className="flex-row p-3">
        <Column
          style={{
            width: "150px",
            flexGrow: 0,
            flexShrink: 0,
            background: "#222",
            borderRadius: "4px",
            position: "relative",
          }}
        >
          <ActorImage />
          <div
            style={{
              position: "absolute",
              top: "50%",
              width: "60px",
              height: "60px",
              color: colors.hint,
              textAlign: "center",
            }}
          >
            <ACShield />
          </div>
        </Column>
        <ActorInfo />
      </div>
    </header>
  );
}
