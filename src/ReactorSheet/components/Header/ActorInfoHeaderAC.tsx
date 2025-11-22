import styled from "styled-components";
import { Text, TextSmall } from "../shared/elements";
import { colors } from "../shared/elements-vars";

const ACContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export default function ActorInfoHeaderAC() {
  return (
    <ACContainer>
      <div style={{ textAlign: "center" }}>
        <TextSmall $color="label" style={{ textWrap: "nowrap" }}>
          Armor Class
        </TextSmall>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          height: "100%",
        }}
      >
        <i
          className="fa-regular fa-shield"
          style={{
            position: "absolute",
            color: colors.hint,
            fontSize: 38,
            top: 0,
          }}
        ></i>
        <i
          className="fa-regular fa-shield"
          style={{
            position: "absolute",
            color: colors.bgDark3,
            fontSize: 36,
            top: 1,
          }}
        ></i>

        <Text $color="emphatic" style={{ marginTop: -4 }}>
          15
        </Text>
      </div>
    </ACContainer>
  );
}
