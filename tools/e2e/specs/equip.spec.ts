import { test, expect } from "@playwright/test";
import { joinAsGM, openCharacterSheet, itemId, itemGet } from "../helpers";

test.describe("equip / unequip", () => {
  test("toggling equip flips the item's equipped state", async ({ page }) => {
    await joinAsGM(page);
    const sheet = await openCharacterSheet(page);
    await sheet.locator('[data-testid="tab-inventory"]').click();

    const dagger = await itemId(page, "Dagger");
    const equip = sheet.locator(`[data-testid="equip-${dagger}"]`);
    await expect(equip).toBeVisible();

    const wasEquipped = await itemGet(page, "Dagger", "system.equipped");
    await equip.click();

    await expect
      .poll(() => itemGet(page, "Dagger", "system.equipped"), { timeout: 15_000 })
      .toBe(!wasEquipped);
    await expect(equip).toHaveAttribute("aria-pressed", String(!wasEquipped));
  });
});
