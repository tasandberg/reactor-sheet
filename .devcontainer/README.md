# Cloud dev: Foundry + Vite in GitHub Codespaces

Gives **interactive, in-game** visual review of the sheet from a browser — the thing the
headless cloud agent (see `../CLOUD.md`) can't do. Runs a real Foundry + the Vite dev server
in a Codespace and forwards the Vite port to your browser with HMR.

## What's here

- `docker-compose.yml` — two services on one network:
  - `foundry` — `felddy/foundryvtt:13`, self-contained (no sibling-repo mounts), data in a
    named volume. Uses the **released** OSE system, not the local masquerade dev mounts.
  - `app` — node 22 devcontainer where VS Code / Claude Code attaches and `pnpm dev` runs.
- `devcontainer.json` — forwards **30001** (Vite, the one you open) and 30000 (Foundry direct),
  runs `pnpm install` on create, declares the Foundry license secrets.
- Vite reaches Foundry via `FOUNDRY_URL=http://foundry:30000` (honored by `vite.config.ts`).

## One-time setup

1. **Codespaces secrets** (GitHub → Settings → Codespaces → Secrets), scoped to this repo:
   `FOUNDRY_USERNAME`, `FOUNDRY_PASSWORD`, `FOUNDRY_ADMIN_KEY`. felddy uses these to fetch +
   license Foundry on first boot.
2. **Open in a Codespace** (Code → Codespaces → Create). Wait for `pnpm install`.
3. **Install the OSE system (once).** It persists in the `foundry-data` volume:
   - Open the forwarded **30000** URL → Foundry setup → Game Systems → Install System →
     search "Old-School Essentials" → Install. (reactor-sheet requires the `ose` system.)
   - *(Automation follow-up: do this in `postCreate` via the `fvtt` CLI — not wired yet.)*

## Daily loop

1. `pnpm dev` in the `app` terminal (Vite on 30001, proxying Foundry).
2. Open the forwarded **30001** URL — **not** 30000. Vite serves the live React bundle and
   proxies everything else (incl. the socket.io websocket) to Foundry.
3. Create/launch a world on the `ose` system, enable the **OSE Re-Actor Sheet** module, open a
   character → edits to `src/**` hot-reload in place.

## Known gotchas

- **Open 30001, never 30000**, for sheet dev. 30000 is the raw Foundry (no React HMR); it's only
  there for first-run system install.
- **Vite HMR behind the Codespaces HTTPS edge** may fall back to full reload (websocket can't
  reach `clientPort`). If hot reload is flaky, set `server.hmr.clientPort = 443` in `vite.config.ts`
  (or run with `--host`). Preview still works regardless; only in-place HMR is affected.
- **Free-tier hours**: a Codespace burns core-hours while running (≈60h/mo on a 2-core box).
  Stop it when idle — it doesn't auto-stop instantly.
- **Foundry license is single-seat**: don't run this Codespace and your local Foundry against the
  same license simultaneously.

## Local use (outside Codespaces)

`docker compose -f .devcontainer/docker-compose.yml up foundry` with a `.devcontainer/.env`
holding the `FOUNDRY_*` vars works too — but locally you'd usually prefer the richer
`local-foundry/v13` stack (masquerade dev OSE, sibling modules). This stack is the *cloud*-shaped,
self-contained variant.
