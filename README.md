# OSE Re-Actor Sheet

A fresh, responsive character sheet for **[Old School Essentials](https://necroticgnome.com/)** in Foundry VTT — rebuilt in React for a faster, cleaner play experience.

> **Requires the [Old School Essentials](https://foundryvtt.com/packages/ose) game system.** Re-Actor replaces the character sheet; your actors, items, and data are untouched.

![Foundry v13](https://img.shields.io/badge/Foundry-v13%E2%80%93v14-informational) ![System: OSE](https://img.shields.io/badge/system-OSE-orange)

---

## Install

Re-Actor will be on the official Foundry package listing soon. Until then, install by manifest:

1. In Foundry, open **Add-on Modules → Install Module**.
2. Paste this **Manifest URL** into the bottom field:

   ```
   https://raw.githubusercontent.com/tasandberg/reactor-sheet/main/module.json
   ```

3. Click **Install**.
4. Launch your OSE world, then enable **OSE Re-Actor Sheet** under **Game Settings → Manage Modules**.

Open any character actor — Re-Actor takes over as the sheet automatically.

## Why Re-Actor

### Responsive by design — reclaim your screen

The sheet adapts to whatever space you give it. Drag the window narrow and tabs collapse to the bottom with a compact stat minibar; widen it and navigation moves to a roomy side rail. Run a tight one-window-among-many table without sacrificing legibility, or stretch out when you've got the room.

### Pop out for the luxe experience

Send the sheet to its own browser window and treat it like a proper play surface — full-size on a second monitor or tablet while your map and tokens own the main screen. Same sheet, all the elbow room.

### Built for OSE

Coins, encumbrance, weapon tags, attacks, and inventory are modeled on the OSE data system — drag an item to the macro hotbar to spin up an attack macro, equip from the inventory, and keep your numbers in sync with the actor.

## Compatibility

| | |
|---|---|
| **Foundry VTT** | v13 minimum · v14 verified |
| **Game system** | Old School Essentials (`ose`) |

## Feedback & issues

Bug reports and feature requests are welcome on the [issue tracker](https://github.com/tasandberg/reactor-sheet/issues).

---

## Built with foundry-vtt-react

Re-Actor is a React application mounted onto Foundry's ApplicationV2 via **[foundry-vtt-react](https://www.npmjs.com/package/foundry-vtt-react)** — a small framework for building React-powered sheets and apps that stay in sync with Foundry documents. If you're building your own React sheet, that's the place to start.

## Development

```bash
pnpm dev      # Vite dev server, hot-reloaded into local Foundry
pnpm build    # tsc -b && vite build → dist/
pnpm lint
pnpm test
```

**Release:** `pnpm build`, then `pnpm release --type=<patch|minor|major>` (add `--dry-run` to preview). The release script builds to `dist/`, bumps the version in `module.json`, commits, pushes, and cuts a tagged GitHub release.
