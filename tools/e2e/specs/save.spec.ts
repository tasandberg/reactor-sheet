import { test, expect } from "@playwright/test";
import {
  joinAsGM,
  openCharacterSheet,
  chatCount,
  confirmRollDialogIfPresent,
} from "../helpers";

test.describe("saving throws", () => {
  test("rolling a death save posts a chat message", async ({ page }) => {
    await joinAsGM(page);
    const sheet = await openCharacterSheet(page);

    const before = await chatCount(page);
    await sheet.locator('[data-testid="save-death"]:visible').first().click();
    await confirmRollDialogIfPresent(page);

    await expect.poll(() => chatCount(page), { timeout: 15_000 }).toBeGreaterThan(before);
  });
});
