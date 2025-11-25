import styled from "styled-components";
import { colors } from "../shared/elements-vars";

/* eslint-disable max-len */
interface HPHeart {
  value: number;
  max: number;
  styles?: React.CSSProperties;
}

const HeartContainer = styled.div`
  width: 99%;
  height: 99%;
`;

const HeartSvg = styled.svg`
  width: 99%;
  height: 99%;
  overflow: visible;
`;

export default function HPHeart({ value, max, styles }: HPHeart) {
  const heartPath =
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";

  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  // Transform to scale heart from its original bounds to fill 0,0 24,24
  // Original bounds: x: 2-22 (width 20), y: 3-21.35 (height 18.35)
  // Scale factors: x: 24/20 = 1.2, y: 24/18.35 = 1.308
  // Translate: move from (2,3) to (0,0): translate(-2, -3) then scale
  const heartTransform = "translate(-2, -3) scale(1.2, 1.308)";

  // Update bounds for the scaled heart
  const heartTop = 0;
  const heartBottom = 24;
  const heartHeight = heartBottom - heartTop;

  return (
    <HeartContainer style={styles}>
      <HeartSvg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="heart-mask">
            <path d={heartPath} fill="white" transform={heartTransform} />
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
            <stop offset="0%" stopColor="#5d142b" />
            <stop offset="100%" stopColor="#8a1f3d" />
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
          transform="rotate(4 12 12)"
        />

        {/* Heart outline */}
        <path
          d={heartPath}
          fill="none"
          stroke={colors.hint}
          strokeWidth={0.5}
          transform={heartTransform}
        />
      </HeartSvg>
    </HeartContainer>
  );
}
