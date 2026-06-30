import { test, expect } from "../fixtures";
import { openCharacterSheet, ACTOR_NAME, itemId } from "../helpers";
import type { Page, Locator } from "@playwright/test";

const ARMOR = "Leather Armor";

/** Set the OSE ascending-AC world setting (GM only). */
async function setAscending(page: Page, value: boolean) {
  await page.evaluate(async (v) => {
    const g = globalThis as any;
    await g.game.settings.set(g.game.system.id, "ascendingAC", v);
  }, value);
}

async function getAscending(page: Page): Promise<boolean> {
  return page.evaluate(
    () => !!(globalThis as any).game.settings.get((globalThis as any).game.system.id, "ascendingAC"),
  );
}

/** Equip/unequip the armour via the API (used once up front to capture expected AC). */
async function setEquippedApi(page: Page, equipped: boolean) {
  await page.evaluate(
    async ({ name, eq }) => {
      const a = (globalThis as any).game.actors.getName(name);
      await a.items.getName("Leather Armor").update({ "system.equipped": eq });
    },
    { name: ACTOR_NAME, eq: equipped },
  );
}

/** Both schemes' computed AC for the actor's current equip state. */
async function acBoth(page: Page): Promise<{ asc: number; desc: number }> {
  return page.evaluate((name) => {
    const a = (globalThis as any).game.actors.getName(name);
    return { asc: a.system.aac.value as number, desc: a.system.ac.value as number };
  }, ACTOR_NAME);
}

test.describe("AC display follows the ascendingAC setting", () => {
  test("equipping armour updates AC correctly in descending and ascending modes", async ({
    gamePage,
  }) => {
    const original = await getAscending(gamePage);

    // Capture expected values once via the API (both schemes per prep), then assert
    // the *optimistic* header instantly on each UI click — no per-toggle round-trip wait.
    await setEquippedApi(gamePage, false);
    const naked = await acBoth(gamePage);
    await setEquippedApi(gamePage, true);
    const armored = await acBoth(gamePage);
    await setEquippedApi(gamePage, false); // baseline: unequipped
    expect(armored).not.toEqual(naked);

    const sheet = await openCharacterSheet(gamePage);
    const armorId = await itemId(gamePage, ARMOR);
    const acValue = sheet.locator('[data-testid="ac-value"]');

    try {
      for (const ascending of [false, true]) {
        await setAscending(gamePage, ascending);
        await sheet.locator('[data-testid="tab-inventory"]').click();
        const equip = sheet.locator(`[data-testid="equip-${armorId}"]`);

        // Equip → optimistic header shows the armoured value for this scheme.
        await equip.click();
        await expect(acValue).toHaveText(String(ascending ? armored.asc : armored.desc));

        // Unequip → reverts to naked.
        await equip.click();
        await expect(acValue).toHaveText(String(ascending ? naked.asc : naked.desc));
      }
    } finally {
      await setAscending(gamePage, original);
    }
  });
});
