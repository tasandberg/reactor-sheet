// Vellum-themed attack & damage chat cards for the sheet's own Hit/Damage cells.
//
// The chat log lives OUTSIDE the `.reactor-sheet` scope, so the card markup carries
// its own `.reactor-card` root class and the styles in `styles/chat.scss` are scoped
// under it (with literal hex fallbacks — chat sits in the global :root, not [data-theme]).
//
// HIT card: if the user has a target, we compare the roll against the target's AC
// (ascending: d20+bonus ≥ AAC; descending: THAC0−total ≤ AC) and show HIT/MISS. Nat 1
// always misses, nat 20 always hits (matching OSE). No target → no hit/miss line.
//
// DAMAGE card: shows the rolled total and (for the target, if any) stamps the target
// name + a GM-only "Apply" button wired by the renderChatMessageHTML hook (see
// applyDamage.ts). Applied-once is guarded by a message flag.

import type { OSEActor } from "../types/types";
import type { RollSpec } from "../viewModels/types";
import { MODULE_ID } from "../flags";
import { currentTarget, usesAscendingAC, type TargetInfo } from "./targeting";

/** escape user/actor strings before interpolating into card HTML. */
function esc(s: string): string {
  return foundry.utils.escapeHTML(String(s ?? ""));
}

/** Natural die face of the first d20 term, or null if the roll has no d20. */
function natD20(roll: Roll): number | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const t of roll.terms as any[]) {
    if (t?.faces === 20 && t?.results?.length) return t.results[0].result as number;
  }
  return null;
}

/** Pure hit/miss rule (B/X). `nat` = natural d20 face (1 always misses, 20 always
 *  hits); `total` already includes the cell's ability mod. Ascending: total + the
 *  attacker's base attack bonus (bba) ≥ target AAC. Descending: attacker THAC0 −
 *  total ≤ target AC. Exported for unit testing. */
export function evaluateHit(opts: {
  nat: number | null;
  total: number;
  ascending: boolean;
  bba: number;
  thac0: number;
  target: Pick<TargetInfo, "aac" | "ac">;
}): boolean {
  if (opts.nat === 1) return false;
  if (opts.nat === 20) return true;
  return opts.ascending
    ? opts.total + opts.bba >= opts.target.aac
    : opts.thac0 - opts.total <= opts.target.ac;
}

/** Resolve hit vs miss for an evaluated d20 roll against a target. */
function resolveHit(roll: Roll, attacker: OSEActor, target: TargetInfo): boolean {
  const sys = attacker.system as { thac0?: { value: number; bba: number } };
  return evaluateHit({
    nat: natD20(roll),
    total: roll.total ?? 0,
    ascending: usesAscendingAC(),
    bba: sys.thac0?.bba ?? 0,
    thac0: sys.thac0?.value ?? 19,
    target,
  });
}

/** Card shell: ink header band + body, all under `.reactor-card`. */
function shell(title: string, weapon: string | undefined, body: string): string {
  const sub = weapon ? `<span class="rc-weapon">${esc(weapon)}</span>` : "";
  return `<div class="reactor-card"><div class="rc-head"><span class="rc-title">${esc(
    title
  )}</span>${sub}</div><div class="rc-body">${body}</div></div>`;
}

/** Post a Vellum chat card for a sheet Hit/Damage roll. Falls back to a plain card
 *  shell either way; the only behavioural fork is the optional target line. */
export async function postRollCard(actor: OSEActor, spec: RollSpec): Promise<void> {
  const speaker = ChatMessage.getSpeaker({ actor });
  const roll = await new Roll(spec.formula).evaluate();
  const total = roll.total ?? 0;
  const target = currentTarget();
  const rolled = await roll.render(); // Foundry's dice-tooltip block

  let body = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flags: Record<string, any> = {};

  if (spec.kind === "hit") {
    body += rolled;
    if (target) {
      const hit = resolveHit(roll, actor, target);
      body += `<div class="rc-verdict ${hit ? "is-hit" : "is-miss"}">${
        hit ? "HIT" : "MISS"
      } <span class="rc-vs">vs ${esc(target.name)}</span></div>`;
    }
  } else if (spec.kind === "damage") {
    body += rolled;
    if (target) {
      body +=
        `<div class="rc-target">→ ${esc(target.name)}</div>` +
        // GM-only apply button; hydrated/guarded by the renderChatMessageHTML hook.
        `<button type="button" class="rc-apply" data-action="reactor-apply-damage">` +
        `<i class="fa-solid fa-droplet" aria-hidden="true"></i> Apply ${total} damage</button>`;
      flags.damage = { amount: total, targetUuid: target.uuid, targetName: target.name };
      flags.damageApplied = false;
    }
  } else {
    body += rolled;
  }

  const title = spec.kind === "damage" ? "Damage" : "Attack";
  await ChatMessage.create({
    speaker,
    flavor: spec.flavor,
    rolls: [roll],
    content: shell(title, spec.weapon, body),
    flags: { [MODULE_ID]: flags },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);
}
