import { test, expect } from "@playwright/test";
import {
  joinAsGM,
  openCharacterSheet,
  chatCount,
  confirmRollDialogIfPresent,
} from "../helpers";

test.describe("ability checks", () => {
  test("rolling a STR check posts a chat message", async ({ page }) => {
    await joinAsGM(page);
    const sheet = await openCharacterSheet(page);
    await sheet.locator('[data-testid="tab-actions"]').click();

    const before = await chatCount(page);
    await sheet.locator('[data-testid="ability-str"]:visible').first().click();
    await confirmRollDialogIfPresent(page);

    await expect.poll(() => chatCount(page), { timeout: 15_000 }).toBeGreaterThan(before);
  });
});
