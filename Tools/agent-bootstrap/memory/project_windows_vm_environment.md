---
name: project-windows-vm-environment
description: Since 2026-10-04 the project lives on a Windows 11 VM (agent + Claude desktop app on the same host); how it was bootstrapped from git
metadata:
  node_type: memory
  type: project
---

Working dir: `C:\Users\cloude-agent\work\AoW4_RbbP_Wiki` (Windows 11, Git Bash for Claude Code). Previously Linux `/home/lyas/AoW4_RbbP_Wiki`. The environment was bootstrapped from the repo itself: `Tools/agent-bootstrap/` (memory files, settings templates, `install.py`, prompt) and `Tools/dev/` (test/convert tooling, fixture docx).

**Why:** the owner migrated the whole workflow to a new server and wanted context to survive; everything durable lives in git (`CLAUDE.md` sections 8-9, memory copies, tooling) because the old machine's scratch dir and session transcript were not portable.

**How to apply:** on Windows use `python`/`py -3` instead of `python3`, set `PYTHONUTF8=1`, keep `git config core.autocrlf input` (CRLF breaks `^...$` regexes in the scripts), no `pkill`/`/tmp`. If memory or settings look missing after a fresh clone, run `python Tools/agent-bootstrap/install.py` (add `--smoke` to verify). Related: [[project-sandbox-not-user-machine]], [[project-rbbp-publication-rounds]].
