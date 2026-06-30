import { test, expect } from "../fixtures";
import { openCharacterSheet, ACTOR_NAME, itemId, itemGet } from "../helpers";
import type { Page, Locator } from "@playwright/test";

const ARMOR = "Leather Armor";

/** Set the OSE ascending-AC world setting (GM only). */
async function setAscending(page: Page, value: boolean) {
  await page.evaluate(async (v) => {
    const g = globalThis as any;
    await g.game.settings.set(g.game.system.id, "ascendingAC", v);
  }, value);
}

/** Read the current ascending-AC setting. */
async function getAscending(page: Page): Promise<boolean> {
  return page.evaluate(
    () => !!(globalThis as any).game.settings.get((globalThis as any).game.system.id, "ascendingAC"),
  );
}

/** The system's computed AC for a scheme (both are always derived, reflect equip state). */
async function systemAc(page: Page, ascending: boolean): Promise<number> {
  return page.evaluate(
    ({ name, asc }) => {
      const a = (globalThis as any).game.actors.getName(name);
      return (asc ? a.system.aac.value : a.system.ac.value) as number;
    },
    { name: ACTOR_NAME, asc: ascending },
  );
}

/** Toggle the armour to a target equipped state via the inventory equip button. */
async function setEquipped(page: Page, sheet: Locator, armorId: string, want: boolean) {
  if ((await itemGet(page, ARMOR, "system.equipped")) === want) return;
  await sheet.locator('[data-testid="tab-inventory"]').click();
  await sheet.locator(`[data-testid="equip-${armorId}"]`).click();
  await expect
    .poll(() => itemGet(page, ARMOR, "system.equipped"), { timeout: 15_000 })
    .toBe(want);
}

/** Header AC tracks equipped armour for the scheme (equip/unequip re-renders, re-reading the setting). */
async function verifyScheme(page: Page, sheet: Locator, ascending: boolean) {
  await setAscending(page, ascending);
  const armorId = await itemId(page, ARMOR);
  const acValue = sheet.locator('[data-testid="ac-value"]');

  // Equip → AC reflects the armour in this scheme.
  await setEquipped(page, sheet, armorId, true);
  const armored = await systemAc(page, ascending);
  await expect(acValue).toHaveText(String(armored), { timeout: 15_000 });

  // Unequip → reverts to naked (and the armour actually changed the value).
  await setEquipped(page, sheet, armorId, false);
  const naked = await systemAc(page, ascending);
  expect(armored).not.toBe(naked);
  await expect(acValue).toHaveText(String(naked), { timeout: 15_000 });
}

test.describe("AC display follows the ascendingAC setting", () => {
  test("equipping armour updates AC correctly in descending and ascending modes", async ({
    gamePage,
  }) => {
    test.slow(); // two schemes × equip/unequip cycles

    const original = await getAscending(gamePage);
    const sheet = await openCharacterSheet(gamePage);
    try {
      await verifyScheme(gamePage, sheet, false); // descending
      await verifyScheme(gamePage, sheet, true); // ascending
    } finally {
      await setAscending(gamePage, original);
    }
  });
});
