import { test, expect } from "@playwright/test";
import { joinAsGM, openCharacterSheet, itemId, itemGet } from "../helpers";

test.describe("equip / unequip", () => {
  test("toggling equip flips the item's equipped state", async ({ page }) => {
    await joinAsGM(page);
    const sheet = await openCharacterSheet(page);
    await sheet.locator('[data-testid="tab-inventory"]').click();

    // Use the armor so this test stays independent of the weapon the attack
    // test needs kept equipped.
    const armor = await itemId(page, "Leather Armor");
    const equip = sheet.locator(`[data-testid="equip-${armor}"]`);
    await expect(equip).toBeVisible();

    const wasEquipped = await itemGet(page, "Leather Armor", "system.equipped");
    await equip.click();

    await expect
      .poll(() => itemGet(page, "Leather Armor", "system.equipped"), { timeout: 15_000 })
      .toBe(!wasEquipped);
    await expect(equip).toHaveAttribute("aria-pressed", String(!wasEquipped));
  });
});
