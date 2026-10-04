---
name: project-rbbp-publication-rounds
description: How the RBBP page gets updated - owner sends a Word draft, we convert/translate/verify, owner reviews screenshots; tooling lives in Tools/dev
metadata:
  node_type: memory
  type: project
---

The owner (GitHub lyas77) periodically sends a new Word draft `RBBP_doc_DDMMYYYY.docx` for the RBBP balance-mod long-read page. Round = convert docx -> RU markdown (`Tools/dev/rbbp_clean_docx.py`), diff against previous `RBBP_doc_N.md`, translate only the NEW parts to EN by hand (`{{Name}}` markers), verify (`Tools/dev/rbbp_verify.py`), build JSON (`Tools/rbbp_convert_doc.py`), test (`Tools/dev/rbbp_check.js` + screenshots), owner reviews, "мерж", deploy check, then owner often asks for the fixed docx back (`Tools/dev/build_docx.js`) to fold fixes into his master file.

**Why:** the maintainer's master doc keeps reintroducing the same export artifacts (missing affinity icon codes, wrong English names in parentheses), so fixes must be re-applied each round until his master is updated. All accumulated knowledge (entity-index categories, terminology rules, data gaps) is in CLAUDE.md section 8-9 - read it first.

**How to apply:** start any RBBP task by reading CLAUDE.md sections 8-9 and Tools/dev/README.md. Terminology the owner corrected: unit hiring paid with [draft] -> "Draft/draftable"; hero and trader hiring -> "Recruit/Recruitment"; RU "однократные атаки" -> "Single Shot attacks". State as of 2026-10-04: main = 71d238c, last published draft 29.09 (RBBP_doc_7.md/_EN.md).
