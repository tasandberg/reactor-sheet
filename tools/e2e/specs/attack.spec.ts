import { test, expect } from "@playwright/test";
import {
  joinAsGM,
  openCharacterSheet,
  chatCount,
  confirmRollDialogIfPresent,
  itemId,
} from "../helpers";

test.describe("weapon attacks", () => {
  test("toggling attack mode and rolling to hit posts a chat message", async ({ page }) => {
    await joinAsGM(page);
    const sheet = await openCharacterSheet(page);
    await sheet.locator('[data-testid="tab-actions"]').click();

    const dagger = await itemId(page, "Dagger");

    // Dagger is melee+missile → a segmented mode toggle. Switch to missile.
    const missile = sheet.locator(`[data-testid="attack-mode-missile-${dagger}"]`);
    if (await missile.isVisible().catch(() => false)) {
      await missile.click();
      await expect(missile).toHaveAttribute("aria-pressed", "true");
    }

    const before = await chatCount(page);
    await sheet.locator(`[data-testid="weapon-hit-${dagger}"]`).click();
    await confirmRollDialogIfPresent(page);

    await expect.poll(() => chatCount(page), { timeout: 15_000 }).toBeGreaterThan(before);
  });
});
