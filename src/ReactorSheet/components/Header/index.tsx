import { colors } from "../shared/elements-vars";
import ActorInfo from "./ActorInfo";
import styled from "styled-components";
import { useState } from "react";

const CollapseButton = styled.div`
  position: absolute;
  top: calc(100% - 10px);
  left: calc(50% - 10px);
  width: 20px;
  height: 20px;
  padding: 2px;
  background-color: ${colors.bgDark3};
  border: 1px solid ${colors.border};
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

export default function Header() {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <header
      style={{
        backgroundColor: "#222",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.5)",
        borderBottom: `1px solid ${colors.border}`,
        position: "relative",
        zIndex: 2,
        display: "flex",
        width: "100%",
      }}
    >
      <div
        style={{
          height: collapsed ? "90px" : "375px",
          transition: "height 0.5s ease-in-out",
          overflow: "hidden",
          width: 600,
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        <ActorInfo />
      </div>
      <CollapseButton onClick={() => setCollapsed(!collapsed)}>
        <i
          className={`fas fa-chevron-down`}
          style={{
            fontSize: "12px",
            transform: collapsed ? "scale(1)" : "scale(-1)",
            transition: "transform 0.9s ease-in-out",
          }}
        />
      </CollapseButton>
    </header>
  );
}
