"""Архив старых патчноутов (markdown с записями '@@ версия | YYYY-MM-DD') -> Data/<LANG>/RBBPOldPatchNotes.json.

    python Tools/rbbp_convert_old_notes.py RBBP_Old_patchNotes_RU.md Data/RU/RBBPOldPatchNotes.json

Формат: строка '@@ 1.5.7 | 2025-12-18' начинает запись; дальше обычный markdown (##/###/списки),
опционально абзац '_Название_'. Записи в файле идут по возрастанию даты; в JSON пишутся новыми сверху.
Страница: HTML/RBBPPatchNotes.html?section=old (без автосвязывания сущностей и иконок).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from rbbp_convert_doc import convert  # noqa: E402


def parse(md):
    patches, cur = [], None
    for line in md.replace("\r\n", "\n").split("\n"):
        m = re.match(r"^@@\s*(\S+)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*$", line)
        if m:
            cur = {"version": m.group(1), "date": m.group(2), "lines": []}
            patches.append(cur)
        elif cur is not None:
            cur["lines"].append(line)
    out = []
    for p in patches:
        body = "\n".join(p["lines"]).strip()
        out.append({"version": p["version"], "date": p["date"], "html": convert(body)})
    versions = [p["version"] for p in out]
    assert len(versions) == len(set(versions)), "версии не уникальны"
    return list(reversed(out))  # новые сверху: при равных датах порядок сохраняется стабильной сортировкой


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    patches = parse(Path(src).read_text(encoding="utf-8"))
    Path(dst).write_text(json.dumps({"patches": patches}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("OK ->", dst, "| патчей:", len(patches))
