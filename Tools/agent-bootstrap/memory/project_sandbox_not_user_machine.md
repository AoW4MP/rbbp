---
name: project-sandbox-not-user-machine
description: "This CLI session's shell is not the same machine as the user's browser - localhost links don't work for preview"
metadata: 
  node_type: memory
  type: project
  originSessionId: ba49d777-35b4-44a3-b3c2-db3b306dd1dd
  modified: 2026-08-20T23:53:28.794Z
---

The shell this session runs in is a separate sandbox from the machine where the user's browser lives. A local test server (e.g. `python3 -m http.server` used for Puppeteer testing) is only reachable from tools *inside* this session (Puppeteer, Bash curl, etc.) - giving the user a `localhost:PORT/...` link to click themselves fails with `ERR_CONNECTION_REFUSED`.

**Why:** Confirmed 2026-08-20 - offered `http://localhost:8811/rbbp/HTML/RBBP.html` for the user to open directly, and their browser couldn't connect, even though the server was verifiably still running in-session (`ps aux` showed it alive).

**How to apply:** For "let me preview this myself" requests, don't offer a bare localhost link. Options that actually work: (1) send screenshots/GIFs via SendUserFile, (2) build a self-contained static Artifact snapshot (data baked in, no live fetches - note this repo's pages rely on live JSON fetches + jQuery + shared site JS, so a faithful Artifact port takes real extra work, not a trivial republish), or (3) just proceed straight to commit/PR/merge and let the user check the deployed GitHub Pages site (aow4mp.github.io/rbbp/...) after the Pages deploy finishes - this is what the user chose when offered the choice ("посмотрю на проме"). Ask which they want rather than assuming.

**Update 2026-10-04 (project moved to a Windows 11 VM):** the agent and the Claude desktop app now run on the SAME VM, so a `localhost` link may actually be openable by the owner there. This is unverified - on the first preview of the new environment, ask the owner once whether `http://localhost:8811/rbbp/HTML/RBBP.html` opens for them (start it with `python Tools/dev/serve.py 8811`). Until confirmed, keep sending screenshots as the default; if it works, record that here and keep screenshots only for visual diffs.
