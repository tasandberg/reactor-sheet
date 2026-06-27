import type { Page, Locator } from "@playwright/test";

export const ACTOR_NAME = "E2E Fighter";
const URL = (process.env.FOUNDRY_URL || "http://localhost:30000").replace(/\/$/, "");

declare const game: any;
declare const foundry: any;
declare const Actor: any;

/** Join the running world as the passwordless Gamemaster and wait for game.ready. */
export async function joinAsGM(page: Page): Promise<void> {
  await page.goto(`${URL}/join`, { waitUntil: "domcontentloaded" });
  const userSelect = page.locator('select[name="userid"]');
  await userSelect.waitFor({ timeout: 30_000 });
  // Options for already-connected users are disabled client-side only; re-enable first.
  await page.evaluate(() => {
    for (const o of document.querySelectorAll('select[name="userid"] option'))
      (o as HTMLOptionElement).disabled = false;
  });
  await userSelect.selectOption({ label: "Gamemaster" });
  await page.click('button[name="join"]');
  await page.waitForFunction(() => (globalThis as any).game?.ready === true, null, {
    timeout: 120_000,
  });
}

/**
 * Open the seeded actor's sheet and return its root locator. The reactor sheet
 * registers under `ose.ReactorSheet` with makeDefault, and global-setup pins the
 * actor's core.sheetClass flag, so render() shows the reactor sheet.
 */
export async function openCharacterSheet(page: Page): Promise<Locator> {
  await page.evaluate(async (name) => {
    const actor = (globalThis as any).game.actors.getName(name);
    if (!actor) throw new Error(`Seed actor "${name}" not found`);
    await actor.sheet.render(true);
    // Force the wide (large) layout tier so the horizontal tab bar renders.
    actor.sheet.setPosition?.({ width: 920, height: 820 });
  }, ACTOR_NAME);
  const sheet = page.locator(".reactor-sheet").first();
  await sheet.waitFor({ state: "visible", timeout: 20_000 });
  return sheet;
}

/** Close every open ApplicationV2 window (reset between specs). */
export async function closeAllWindows(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const app of (globalThis as any).foundry.applications.instances.values())
      app.close?.();
  });
}

/** Current number of chat messages in the world. */
export async function chatCount(page: Page): Promise<number> {
  return page.evaluate(() => (globalThis as any).game.messages.size);
}

/** Read a value off the seeded actor by dot-path (e.g. "system.scores.str.value"). */
export async function actorGet(page: Page, path: string): Promise<unknown> {
  return page.evaluate(
    ({ name, p }) => {
      const actor = (globalThis as any).game.actors.getName(name);
      return (globalThis as any).foundry.utils.getProperty(actor, p);
    },
    { name: ACTOR_NAME, p: path },
  );
}

/** Embedded item id on the seeded actor, by item name. */
export async function itemId(page: Page, name: string): Promise<string> {
  const id = await page.evaluate(
    ({ actor, item }) => {
      const a = (globalThis as any).game.actors.getName(actor);
      return a?.items.getName(item)?.id ?? null;
    },
    { actor: ACTOR_NAME, item: name },
  );
  if (!id) throw new Error(`Item "${name}" not found on ${ACTOR_NAME}`);
  return id as string;
}

/** Read a value off an embedded item by name + dot-path. */
export async function itemGet(page: Page, name: string, path: string): Promise<unknown> {
  return page.evaluate(
    ({ actor, item, p }) => {
      const a = (globalThis as any).game.actors.getName(actor);
      const it = a?.items.getName(item);
      return (globalThis as any).foundry.utils.getProperty(it, p);
    },
    { actor: ACTOR_NAME, item: name, p: path },
  );
}

/** Dismiss an OSE roll-config dialog if one popped (click its primary/Roll button). */
export async function confirmRollDialogIfPresent(page: Page): Promise<void> {
  const dialogBtn = page
    .locator(
      '.application.dialog button, dialog[open] button[data-action="roll"], .dialog button.roll, button[data-button="roll"]',
    )
    .first();
  if (await dialogBtn.isVisible().catch(() => false)) {
    await dialogBtn.click().catch(() => {});
  }
}
