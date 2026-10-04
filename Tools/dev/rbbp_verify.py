"""Проверка пары RU/EN markdown перед публикацией (запускать из корня репо).

    python Tools/dev/rbbp_verify.py RBBP_doc_7.md RBBP_doc_7_EN.md [RBBP_doc_6.md]

1. Совпадение уровней заголовков (#/##/###) RU и EN.
2. Позиционное совпадение последовательности [код]-токенов (ловит разъехавшийся порядок разделов,
   см. CLAUDE.md "Методика проверки структурного порядка").
3. Все {{Имя}} из EN резолвятся в индексе сущностей (иначе на странице останется голый маркер).
4. RU: какие "(EnglishName)" НЕ резолвятся (если передан 3-й аргумент - только НОВЫЕ относительно него).
Индекс - Python-реплика BuildRbbpEntityIndexByEnglishName из HTML/RBBP.html (если меняется JS - обновить здесь).
"""
import json
import re
import sys
from collections import Counter

# должно совпадать с RBBP_EXCLUDED_EN_NAMES в HTML/RBBP.html
EXCLUDED = {"Crossbow", "Floating Daggers", "Floating", "Magelock", "Greatbow", "Bow", "Blowgun", "Sword and Crossbow",
            "Pistol and Sword", "Javelin", "Sword and Daggers", "Sword and Net", "Sword and Whip", "Champion", "Observer",
            "Tower", "Frozen", "Haunted", "Dragon", "Construct", "Animal", "Fury", "Frost Giant", "Rock Giant", "Vigor",
            "Defense"}
ITEMS = ("Cryptblade", "Druid's Staff", "Relic of Mind", "White Wolf Mount")   # RBBP_ITEM_NAMES
UNIT_TYPES = ("Tower", "Siegecraft", "Construct")                               # RBBP_UNIT_TYPE_ICONS (обходят EXCLUDED)
CITY_TIERS = ("Town Hall I", "Town Hall II", "Town Hall III", "Town Hall IV")   # RBBP_CITY_TIER_STRUCTURES


def load(name):
    with open(f"Data/EN/{name}.json", encoding="utf-8") as f:
        return json.load(f)


def build_index():
    idx = {}

    def add(name, kind):
        if not name:
            return
        name = re.sub(r"^<[a-zA-Z]+></[a-zA-Z]+>\s*", "", name).strip()
        name = re.sub(r"\s*<[a-zA-Z]+></[a-zA-Z]+>\s*$", "", name).strip()
        if len(name) < 3 or name in EXCLUDED:
            return
        idx.setdefault(name, kind)

    for x in load("Tomes"):
        if x.get("icon"):
            add(x["name"], "tome")
    for x in load("StructureUpgrades"):
        if x.get("icon"):
            add(x["name"], "structure")
    for x in load("Units"):
        if x.get("id"):
            add(x["name"], "unit")
    for x in load("Spells"):
        if x.get("icon") or x.get("id"):
            add(x["name"], "spell")
    # items идут ДО способностей
    items_en = {x["name"] for x in load("HeroItems") if x.get("icon")}
    for n in ITEMS:
        if n in items_en:
            add(n, "item")
    for x in load("Abilities"):
        if x.get("icon"):
            add(x["name"], "ability")
    for x in load("EmpireProgression"):
        if x.get("icon"):
            add(x["name"], "empire")
    for x in load("HeroSkills"):
        if x.get("icon"):
            add(x["name"], "heroskill")
    for x in load("Traits"):
        if x.get("type") in ("form", "society") and x.get("icon"):
            add(x["name"], "trait")
    for x in load("SiegeProjects"):
        if x.get("icon"):
            add(x["name"], "siege")
    for n in CITY_TIERS:
        add(n, "citytier")
    for t in load("Tomes"):
        for s in t.get("skills", []):
            if s.get("type") == "<hyperlink>Empire Bonus</hyperlink>":
                add(s["name"], "tomeskill")
    for n in UNIT_TYPES:
        idx[n] = "unittype"
    return idx


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def heading_levels(t):
    return [re.match(r"(#+)", l).group(1) for l in t.split("\n") if l.startswith("#")]


def codes(t):
    return re.findall(r"\[([a-z0-9_]+)\]", t)


def ru_parens(t):
    return Counter(m.strip() for m in re.findall(r"\(([A-Z][A-Za-z0-9'\-\s:]*?)\)", t))


def main(ru_path, en_path, base_path=None):
    ru, en = read(ru_path), read(en_path)
    ok = True

    hr, he = heading_levels(ru), heading_levels(en)
    print(f"заголовки: RU {len(hr)} / EN {len(he)} ->", "OK" if hr == he else "РАЗЛИЧАЮТСЯ")
    ok &= hr == he

    cr, ce = codes(ru), codes(en)
    print(f"[код]-токены: RU {len(cr)} / EN {len(ce)} ->", "OK" if cr == ce else "РАЗЛИЧАЮТСЯ")
    if cr != ce:
        ok = False
        for i, (a, b) in enumerate(zip(cr, ce)):
            if a != b:
                print(f"  первое расхождение: позиция {i}, RU [{a}] / EN [{b}]")
                break

    idx = build_index()
    markers = re.findall(r"\{\{([^}]+)\}\}", en)
    bad = sorted({m for m in markers if m not in idx})
    print(f"EN-маркеры {{{{}}}}: {len(markers)}, не резолвятся: {bad if bad else 'нет'}")
    ok &= not bad

    miss = {n for n in ru_parens(ru) if n not in idx}
    if base_path:
        miss -= {n for n in ru_parens(read(base_path)) if n not in idx}
        print("RU (Name), НОВЫЕ нерезолвящиеся (структурные заголовки вроде Mixed/Special - норма):")
    else:
        print("RU (Name), нерезолвящиеся (много штатных: заголовки, исключённые слова, отсутствующие в данных):")
    for n in sorted(miss):
        print("  -", n)

    print("\nИТОГ:", "OK" if ok else "ЕСТЬ ПРОБЛЕМЫ")
    return 0 if ok else 1


if __name__ == "__main__":
    if len(sys.argv) not in (3, 4):
        sys.exit(__doc__)
    sys.exit(main(*sys.argv[1:]))
