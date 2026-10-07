"""Свежий .docx мейнтейнера -> чистый markdown RBBP_doc_N.md (RU), со всеми повторяющимися правками.

    python Tools/dev/rbbp_clean_docx.py RBBP_doc_29092026.docx RBBP_doc_7.md

Требует pandoc в PATH. Делает то, что раньше правилось вручную при каждом экспорте
(см. CLAUDE.md, раздел 8.3 "Повторяющийся баг черновика"):
  * снимает экранирование pandoc (\\[ \\] \\> \\' \\" \\--), NBSP, комментарии <!-- -->;
  * "Steam:[" -> "Steam: [", склеенный Twitch/заголовок, стрей-скобки [50%], жирный "Культуры";
  * вставляет коды иконок в заголовки: 6 affinity (Society Traits И группы книг), классы/типы юнитов;
  * известные опечатки EN-имён в скобках (Summon Wild Animal -> Call Wild Animal и т.д.).
После запуска ОБЯЗАТЕЛЬНО сравнить с предыдущей версией (diff) - мейнтейнер может добавить новое.
"""
import re
import subprocess
import sys

AFFINITY = [("Порядок", "Order", "order"), ("Хаос", "Chaos", "chaos"), ("Природа", "Nature", "nature"),
            ("Тень", "Shadow", "shadow"), ("Материя", "Materium", "materium"), ("Астрал", "Astral", "astral")]

# заголовок "### RU (EN)" -> код портретной иконки (см. PORTRAIT_CODES в Tools/rbbp_convert_doc.py)
HEADING_CODES = [("Герой", "Hero", "classhero"), ("Ударный воин", "Shock Units", "classshock"),
                 ("Мифическое создание", "Mythic Units", "classmythic"),
                 ("Конструкция", "Construct", "typeconstruct"), ("Чудовищный демон", "Infernal Fiend", "typefiend"),
                 ("Нежить", "Undead", "typeundead"), ("Ангел", "Celestial", "typecelestial"),
                 ("Демон мрака", "Umbral Demon", "typeumbral"), ("Бесплотный", "Ethereal", "typeethereal")]

# известные расхождения черновика с игровыми данными: (как в черновике, как должно быть)
NAME_FIXES = [
    ("(Summon Wild Animal)", "(Call Wild Animal)"),
    ("(Sentry-Nests)", "(Sentry Nests)"),
    ("(Arcane Amplifiers Battlements)", "(Arcane Battlements)"),
    ("(Archer Quivers Battlements)", "(Archer Battlements)"),
    ("(Workers Guild)", "(Workers' Guild)"),
    ("(Farmers Guild)", "(Farmers' Guild)"),
    ("(Mechants Guild)", "(Merchants' Guild)"),
    ("(Nightmare Mount)", "(Nightmare Mounts)"),
    ("(Unicorn Mount)", "(Unicorn Mounts)"),
    ("(HOUNDMASTER)", "(Houndmaster)"),
    ("(Tome of Eldritch Pact)", "(Eldritch Pact)"),
]


def main(src, dst):
    raw = subprocess.run(["pandoc", "--wrap=none", "-t", "markdown", src], check=True, capture_output=True).stdout.decode("utf-8")
    t = raw.replace("\r\n", "\n").replace(" ", " ")
    for esc, plain in (("\\[", "["), ("\\]", "]"), ("\\>", ">"), ("\\'", "'"), ('\\"', '"'), ("\\--", "--")):
        t = t.replace(esc, plain)
    t = re.sub(r"^\s*<!-- -->\n", "", t, flags=re.M)
    # pandoc >= 3.8 пишет у ссылок заголовок: [текст](url "url") -> оставляем только [текст](url)
    t = re.sub(r'\]\(([^)\s]+) "[^"]*"\)', r"](\1)", t)
    t = re.sub(r"\n{3,}", "\n\n", t)

    t = t.replace("Steam:[", "Steam: [").replace("Paradox:[", "Paradox: [")
    t = t.replace("  - Twitch:\n\n# [OrgHed](https://www.twitch.tv/orghed)Условия победы",
                  "  - Twitch: [OrgHed](https://www.twitch.tv/orghed)\n\n# Условия победы")
    t = re.sub(r"\[(-?\d+%)\]", r"\1", t)
    t = re.sub(r"^# \*\*Культуры\*\* \(Cultures\)$", "# Культуры (Cultures)", t, flags=re.M)

    for ru, en, code in AFFINITY:
        n = len(re.findall(rf"^## {ru} \({en}\)$", t, flags=re.M))
        t = re.sub(rf"^## {ru} \({en}\)$", f"## [affinity{code}] {ru} ({en})", t, flags=re.M)
        print(f"affinity {code}: {n} заголовков" + ("" if n == 2 else "  <-- ожидалось 2 (Society Traits + Книги)"))
    for ru, en, code in HEADING_CODES:
        n = t.count(f"### {ru} ({en})")
        t = t.replace(f"### {ru} ({en})", f"### [{code}] {ru} ({en})", 1)
        print(f"{code}: {n}" + ("" if n == 1 else "  <-- ожидалось 1"))
    for old, new in NAME_FIXES:
        n = t.count(old)
        if n:
            t = t.replace(old, new)
            print(f"fix {old} -> {new}: {n}")

    with open(dst, "w", encoding="utf-8", newline="\n") as f:
        f.write(t)
    print("OK ->", dst, f"({len(t.splitlines())} строк)")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
