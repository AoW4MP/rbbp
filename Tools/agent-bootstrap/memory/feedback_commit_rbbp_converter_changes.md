---
name: feedback-commit-rbbp-converter-changes
description: Always commit changes to Tools/rbbp_convert_doc.py — never let it live only as a scratch file
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ba49d777-35b4-44a3-b3c2-db3b306dd1dd
  modified: 2026-09-02T21:32:15.947Z
---

Whenever `Tools/rbbp_convert_doc.py` (the RBBP markdown → JSON converter, with the `[code]` → icon dictionaries `INLINE_TAG_CODES`/`PORTRAIT_CODES`) is modified or extended — new icon code added, list-parsing tweaked, etc. — commit the change to the repo in the same session, don't leave it as a local/scratch-only edit.

**Why:** Explicit user request (2026-09-02) after discovering the script had originally only existed in the session's temp scratchpad and would have been lost on the next context reset — see [[project_sandbox_not_user_machine]] for the related scratchpad-volatility lesson. See `CLAUDE.md` section 8 in the repo for the full architecture writeup this converter is documented alongside.

**How to apply:** Treat any edit to this file as needing a commit before the turn/session ends, the same way HTML/JS page changes already go through the established branch → PR → merge workflow in this repo. Don't wait for the user to notice or ask again.
