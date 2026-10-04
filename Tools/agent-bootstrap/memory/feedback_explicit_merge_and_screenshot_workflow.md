---
name: feedback-explicit-merge-and-screenshot-workflow
description: In this repo commit/push/merge only on the owner's explicit word; always show screenshots first; fixed deploy-check routine after merge
metadata:
  node_type: memory
  type: feedback
---

Never commit/push/open or merge a PR until the owner explicitly says so for that specific change set ("комить", "мерж", "мердж", "давай"). Before asking, show screenshot(s) of the result via SendUserFile plus a short summary (done / verified / left). Same for the empty "retrigger" commit when GitHub Pages stalls - propose it, do it only after "да".

**Why:** The owner reviews every visual result themselves and merges in rounds; unrequested commits/merges were never wanted. Followed consistently from Aug-Oct 2026 and repeatedly confirmed ("мерж" after each reviewed round).

**How to apply:** Full routine is in CLAUDE.md section 9 (branch -> specific `git add` -> commit with Co-Authored-By trailer -> push -> `gh pr create` -> `gh pr merge --merge --delete-branch` -> `git checkout main && git pull` -> check Pages deploy ~2.5 min later with `gh run list --limit 3 --json ...` and `gh api repos/AoW4MP/rbbp/pages/builds/latest`; no run after ~5-6 min or stuck in building -> report and propose empty-commit retrigger). Report every result in Russian with the live page link. Related: [[feedback-respond-in-russian]], [[project-sandbox-not-user-machine]].
