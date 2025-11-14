import { APP_ID } from "@src/constants";

export default function getOseMode(): string {
  // @ts-expect-error types
  return game.settings.get(APP_ID, "oseRuleSet");
}
