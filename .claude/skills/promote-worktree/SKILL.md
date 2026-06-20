---
name: promote-worktree
description: Use ONLY when the user explicitly requests promoting a worktree's finished work for review. Commits any stragglers, removes the worktree, and checks the work branch out in the main repo so the dev server shows it. NEVER merges into the feature/integration branch.
---

# promote-worktree

Surface a worktree's finished work in the main checkout for the user to review in their
dev server. Worktrees live under `.claude/worktrees/<name>` on a branch of the same name,
based off the integration branch (currently `osc-sheet`).

**Promotion does NOT merge.** It checks the work branch out in the main repo. Integration
(merging into `osc-sheet`/the feature branch) only ever happens on a separate, explicit
user instruction — never as part of promoting, and never on your own initiative.

## When to use

Only when the user explicitly asks to promote a worktree (e.g. "promote-worktree
actions-redesign" or "let me review the spells work"). Do not promote proactively.

## Steps (in order; stop and report on any failure)

1. **Resolve the target.** Branch/worktree from the argument; else `git worktree list`
   and ask which. `WT=.claude/worktrees/<name>`, `BR=<name>`, `MAIN` = the main repo root
   (the entry not under `.claude/worktrees`). Note `MAIN`'s current branch as `HOME` (e.g.
   `osc-sheet`) so the user can get back. If `MAIN` has uncommitted changes, stash them
   first (e.g. `git stash push -m ...`) so the checkout is clean — report what you stashed.

2. **Ensure committed.** `git -C $WT status --porcelain` must be empty. Commit any
   stragglers on `$BR` first (the agent usually already committed).

3. **Verify gates** (skip if the owning agent already reported them green): in `$WT` run
   `pnpm exec tsc -b`, `pnpm lint`, `pnpm test`, `pnpm build`. All must pass.

4. **Remove the worktree** — this frees `$BR` so it can be checked out in `$MAIN`
   (a branch can only be checked out in one worktree at a time): `git worktree remove $WT`
   (it's clean, so no `--force`). If a peer agent owns it and is idle, send a
   `shutdown_request`.

5. **Check the branch out in the main repo.** From `$MAIN`: `git checkout $BR`. The dev
   server (running the main checkout) now shows the work for review. `node_modules` carries
   over — no reinstall needed (only the source differs between branches).

6. **Report.** State what's now checked out for review, the commit(s), and that the user
   returns to their integration branch with `git checkout $HOME`. Make clear that nothing
   was merged and that integrating is a separate explicit step when they approve.

## Guardrails

- **NEVER merge.** Not into `main`, not into `osc-sheet`, not anywhere. Promotion is a
  checkout for review only.
- **Never push.**
- Don't promote work that hasn't passed its gates.
- Only one branch is checked out in `$MAIN` at a time — promoting a second piece switches
  the main checkout to it; mention that so the user isn't surprised.
- Watch for uncommitted work in `$MAIN` riding along the checkout (it follows you across
  branches). Stash it (step 1) and report it so it doesn't land on the wrong branch.
