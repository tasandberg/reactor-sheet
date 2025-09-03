import { type SVGProps } from "react";

// Full bleed chevron banner that extends to viewport edges
const ChevronBanner = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" {...props}>
    <path
      d="M850 725 500 875 150 725V125 H850 V725 Z"
      fill={props.fill || "currentColor"}
      stroke={props.stroke || "#222"}
      strokeWidth="16"
    />
  </svg>
);

export default ChevronBanner;
