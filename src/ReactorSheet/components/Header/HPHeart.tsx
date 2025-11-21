import styled from "styled-components";
import { colors } from "../shared/elements-vars";

/* eslint-disable max-len */
interface HPHeart {
  value: number;
  max: number;
  styles?: React.CSSProperties;
}

const HeartContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const HeartSvg = styled.svg`
  width: 100%;
  height: 100%;
`;

export default function HPHeart({ value, max, styles }: HPHeart) {
  const heartPath =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  // Heart bounds: approximately y=3 to y=21.35 (height ~18.35)
  const heartTop = 3;
  const heartBottom = 21.35;
  const heartHeight = heartBottom - heartTop;

  return (
    <HeartContainer style={styles}>
      <HeartSvg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="heart-mask">
            <path d={heartPath} fill="white" />
          </mask>
          <clipPath id="fill-clip">
            <rect
              x="0"
              y={String(heartBottom - (heartHeight * percentage) / 100)}
              width="24"
              height={String((heartHeight * percentage) / 100)}
            />
          </clipPath>
          <linearGradient id="heart-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="10%" stopColor="#5d142b" />
          </linearGradient>
        </defs>

        {/* Fill rectangle masked by heart shape */}
        <rect
          x="0"
          y="0"
          width="24"
          height="24"
          fill="black"
          mask="url(#heart-mask)"
          transform="rotate(3 12 12)"
        />
        <rect
          x="0"
          y="0"
          width="24"
          height="24"
          fill="url(#heart-gradient)"
          mask="url(#heart-mask)"
          clipPath="url(#fill-clip)"
          transform="rotate(3 12 12)"
        />

        {/* Heart outline */}
        <path
          d={heartPath}
          fill="none"
          stroke={colors.hint}
          strokeWidth={0.5}
        />
      </HeartSvg>
    </HeartContainer>
  );
}
