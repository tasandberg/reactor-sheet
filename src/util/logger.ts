import APP_INFO from "../../module.json";
const APP_NAME = APP_INFO.id;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function logger(...args: any[]) {
  console.log(`%c[${APP_NAME}]`, "color: #8A2BE2; font-weight: bold;", ...args);
}
