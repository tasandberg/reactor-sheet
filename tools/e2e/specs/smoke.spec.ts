import { test, expect } from "../fixtures";
import { openCharacterSheet } from "../helpers";

// A non-caster fighter shows four tabs; the Spells tab only appears for
// spellcasters (actor.system.spells.enabled).
const TABS = ["actions", "inventory", "abilities", "notes"] as const;

test.describe("smoke", () => {
  test("character sheet opens with its tab bar", async ({ gamePage }) => {
    const sheet = await openCharacterSheet(gamePage);

    await expect(sheet).toBeVisible();
    for (const id of TABS) {
      await expect(sheet.locator(`[data-testid="tab-${id}"]`)).toHaveCount(1);
    }
    // The horizontal tab bar should be the active nav at the forced wide width.
    await expect(sheet.locator('[data-testid="tab-actions"]')).toBeVisible();
  });
});
