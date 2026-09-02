#!/usr/bin/env python3
"""
Конвертер markdown -> HTML для контента страницы RBBP (HTML/RBBP.html,
Data/RU|EN/RBBP.json) и RBBP Patch Notes (Data/RU|EN/RBBPPatchNotes.json).

Использование:
    python3 Tools/rbbp_convert_doc.py <входной .md> <выходной .json>

Пример:
    python3 Tools/rbbp_convert_doc.py RBBP_doc_2.md Data/RU/RBBP.json
    python3 Tools/rbbp_convert_doc.py RBBP_doc_2_EN.md Data/EN/RBBP.json

Формат исходного markdown:
    # Заголовок раздела       -> <h2>
    ## Подраздел               -> <h3>
    ### Под-подраздел          -> <h4>
    - пункт списка             -> <li>, вложенность по отступу (2 пробела/уровень)
    **жирный текст**           -> <strong>
    [текст](url)                -> <a href="url" target="_blank" rel="noopener">текст</a>
    [code]                      -> иконка (см. INLINE_TAG_CODES/PORTRAIT_CODES ниже)

    Между соседними пунктами списка в исходнике может стоять пустая строка -
    это НЕ обрывает список (см. render_list_items/сборщик в convert()).

Иконки-коды [xxx] расставляются вручную автором текста прямо в markdown -
рядом с русским названием, в скобках, как и общий формат "EN-имя в скобках"
(см. CLAUDE.md, раздел "Страница RBBP: конвенция [code]" за общим объяснением
архитектуры). Этот словарь - единственное место в репозитории, где сведены
ВСЕ подтверждённые коды; при добавлении нового - сверяться с Style/icons.css
(для маленьких инлайн-тегов) или с соответствующим Data/GEN|EN/*.json
(для "портретных" иконок физических категорий вроде культур/классов/
губернаторов/стремлений/правителей).
"""
import json
import re
import sys

# ---------- маленькие инлайн-CSS-теги сайта (Style/icons.css): [code] -> <code></code> ----------
INLINE_TAG_CODES = {
    # ресурсы
    "gold": "gold", "mana": "mana", "food": "food", "draft": "draft",
    "production": "production", "happiness": "happiness", "influence": "influence",
    "knowledge": "knowledge", "globalspell": "caststrategic", "combatspell": "casttactical",
    "good": "goodact", "evil": "evilact", "slaves": "thralls",
    "essence": "bindingessence", "fragments": "bindingfragments", "population": "population",
    "warspoils": "warspoils", "favors": "favors", "souls": "souls",
    "embalmedsacrifice": "embalmedsacrifice", "astralecho": "astralechoes",
    # урон и защита
    "physical": "DamagePhysical", "fire": "damagefire", "poison": "damageblight",
    "spirit": "damagespirit", "cold": "damagefrost", "lightning": "damagelightning",
    "resistance": "resistance", "statuseffectresistance": "statuseffectresistance",
    "defense": "defense",
    # типы построек провинций
    "farm": "farm", "forester": "forester", "quarry": "quarry", "mine": "mine",
    "fishery": "fishery", "portal": "conduit", "sciencestation": "researchpost",
    # прочее
    "turn": "turn", "relation": "goodrelation", "hp": "hp", "range": "range",
    "accuracy": "accuracy", "xp": "xp", "temphp": "temphp", "regeneration": "regeneration",
}

# ---------- полноразмерные "портретные" иконки (правители/классы/губернаторы/ ----------
# ---------- стремления героев/культуры/субкультуры) - <img class="rbbp-inline-icon"> ----------
PORTRAIT_CODES = {
    # правители (Ruler Origin) - Data/GEN/FactionCreation.json, Icons/FactionCreation/{icon}.png
    "hero": "/rbbp/Icons/FactionCreation/champion.png",
    "wizardking": "/rbbp/Icons/FactionCreation/wizard_king.png",
    "dragonlord": "/rbbp/Icons/FactionCreation/dragon_lord.png",
    "eldervampire": "/rbbp/Icons/FactionCreation/elder_vampire.png",
    "eldritch": "/rbbp/Icons/FactionCreation/eldritch_sovereign.png",
    "giantking": "/rbbp/Icons/FactionCreation/giant_king.png",
    # классы героев (Class) - тот же файл/папка
    "ranger": "/rbbp/Icons/FactionCreation/ranger.png",
    "warrior": "/rbbp/Icons/FactionCreation/warrior.png",
    "mage": "/rbbp/Icons/FactionCreation/mage.png",
    "ritualist": "/rbbp/Icons/FactionCreation/ritualist.png",
    "defenderclass": "/rbbp/Icons/FactionCreation/defender.png",
    "spellblade": "/rbbp/Icons/FactionCreation/spellblade.png",
    "deathknight": "/rbbp/Icons/FactionCreation/death_knight.png",
    "warlock": "/rbbp/Icons/FactionCreation/warlock.png",
    "battlesaint": "/rbbp/Icons/FactionCreation/battlesaint.png",
    # культуры (Culture) - тот же файл/папка
    "culturefeudal": "/rbbp/Icons/FactionCreation/feudal.png",
    "culturebarbarian": "/rbbp/Icons/FactionCreation/barbarian.png",
    "culturearchitect": "/rbbp/Icons/FactionCreation/architect.png",
    "cultureindustrious": "/rbbp/Icons/FactionCreation/industrious.png",
    "culturehigh": "/rbbp/Icons/FactionCreation/high.png",
    "culturedark": "/rbbp/Icons/FactionCreation/dark.png",
    "culturenomad": "/rbbp/Icons/FactionCreation/nomad.png",
    "culturemystic": "/rbbp/Icons/FactionCreation/mystic.png",
    "cultureoathsworn": "/rbbp/Icons/FactionCreation/oathsworn.png",
    "culturereaver": "/rbbp/Icons/FactionCreation/reaver.png",
    "cultureprimal": "/rbbp/Icons/FactionCreation/primal.png",
    # субкультуры (SubCulture) - тот же файл/папка
    "monarchy": "/rbbp/Icons/FactionCreation/feudal_monarchy.png",
    "aristocracysub": "/rbbp/Icons/FactionCreation/feudal_aristocracy.png",
    "nomadconquerors": "/rbbp/Icons/FactionCreation/nomad_conquerors.png",
    "nomadscavengers": "/rbbp/Icons/FactionCreation/nomad_scavengers.png",
    "schoolattunement": "/rbbp/Icons/FactionCreation/mystic_school_of_attunement.png",
    "schoolpotential": "/rbbp/Icons/FactionCreation/mystic_school_of_potential.png",
    "schoolsummoning": "/rbbp/Icons/FactionCreation/mystic_school_of_summoning.png",
    "oathstrife": "/rbbp/Icons/FactionCreation/oathsworn_oath_of_strife.png",
    "oathrighteousness": "/rbbp/Icons/FactionCreation/oathsworn_oath_of_righteousness.png",
    "oathharmony": "/rbbp/Icons/FactionCreation/oathsworn_oath_of_harmony.png",
    "reaverfederate": "/rbbp/Icons/FactionCreation/reaver_federate.png",
    "reaverimperial": "/rbbp/Icons/FactionCreation/reaver_imperial.png",
    "crocodile": "/rbbp/Icons/FactionCreation/primal_mire_crocodile.png",
    "stormcrow": "/rbbp/Icons/FactionCreation/primal_storm_crow.png",
    "mammoth": "/rbbp/Icons/FactionCreation/primal_glacial_mammoth.png",
    "duneserpent": "/rbbp/Icons/FactionCreation/primal_dune_serpent.png",
    "sabertooth": "/rbbp/Icons/FactionCreation/primal_ash_sabertooth.png",
    "tunnelingspider": "/rbbp/Icons/FactionCreation/primal_tunneling_spider.png",
    "sylvanwolf": "/rbbp/Icons/FactionCreation/primal_sylvan_wolf.png",
    # у этих 8 субкультур нет поля icon в FactionCreation.json, но реальные файлы
    # на диске всё же есть - под id самой субкультуры (не проверялось через сами
    # данные, только через файловую систему + сверку с фильтром субкультур на
    # DarkUnits.html - см. CLAUDE.md, раздел 8.2)
    "archshadow": "/rbbp/Icons/FactionCreation/architects_of_shadow.png",
    "archorder": "/rbbp/Icons/FactionCreation/architects_of_order.png",
    "archchaos": "/rbbp/Icons/FactionCreation/architects_of_chaos.png",
    "archnature": "/rbbp/Icons/FactionCreation/architects_of_nature.png",
    "archmaterium": "/rbbp/Icons/FactionCreation/architects_of_materium.png",
    "archastral": "/rbbp/Icons/FactionCreation/architects_of_astral.png",
    "cultdeath": "/rbbp/Icons/FactionCreation/cult_of_death.png",
    "culttyranny": "/rbbp/Icons/FactionCreation/cult_of_tyranny.png",
    # губернаторы (Data/EN/Governance.json) - Icons/GovernanceIcons/{icon}.png
    # (Wizard Governor и Champion Governor делят одну и ту же иконку в данных игры)
    "eldervampiregov": "/rbbp/Icons/GovernanceIcons/0000049700002E2D.png",
    "giantkinggov": "/rbbp/Icons/GovernanceIcons/0000049700001A1C.png",
    "trollgov": "/rbbp/Icons/GovernanceIcons/0000048D000013FB.png",
    "eldritchgov": "/rbbp/Icons/GovernanceIcons/0000048D0000133B.png",
    "dragongov": "/rbbp/Icons/GovernanceIcons/0000048D00001330.png",
    "wizardgov": "/rbbp/Icons/GovernanceIcons/0000048D00000DDD.png",
    "championgov": "/rbbp/Icons/GovernanceIcons/0000048D00000DDD.png",
    "fortressgov": "/rbbp/Icons/GovernanceIcons/0000048D00000B33.png",
    "specialistgov": "/rbbp/Icons/GovernanceIcons/0000048D00000B31.png",
    "navalgov": "/rbbp/Icons/GovernanceIcons/0000048D00000B28.png",
    "scholargov": "/rbbp/Icons/GovernanceIcons/0000048D00000B22.png",
    "arcanegov": "/rbbp/Icons/GovernanceIcons/0000048D00000B1A.png",
    "prospectgov": "/rbbp/Icons/GovernanceIcons/0000048D00000B13.png",
    "agrigov": "/rbbp/Icons/GovernanceIcons/0000048D00000B0B.png",
    "industrygov": "/rbbp/Icons/GovernanceIcons/0000048D00000B07.png",
    "recruitgov": "/rbbp/Icons/GovernanceIcons/0000048D00000B03.png",
    # стремления героев (Data/EN/Destinies.json) - Icons/AmbitionIcons/{icon}.png
    # код был выбран по RU-названию из документа (см. CLAUDE.md) - официальное
    # EN-имя в данных игры иногда другое (в комментарии рядом)
    "gloryhunter": "/rbbp/Icons/AmbitionIcons/000004AC00000078.png",  # EN: Gloryseeker
    "despot": "/rbbp/Icons/AmbitionIcons/000004AC00000076.png",  # EN: Dominator
    "prospector": "/rbbp/Icons/AmbitionIcons/000004AC00000074.png",
    "defenderdest": "/rbbp/Icons/AmbitionIcons/000004AC00000077.png",  # EN: Defender
    "aristocrat": "/rbbp/Icons/AmbitionIcons/000004AC00000075.png",  # EN: Elitist
    "raiderdest": "/rbbp/Icons/AmbitionIcons/000004AC00000073.png",  # EN: Raider
    "necromancerdest": "/rbbp/Icons/AmbitionIcons/000003C70000022B.png",
    "instructor": "/rbbp/Icons/AmbitionIcons/000004AC00000072.png",
    "martyr": "/rbbp/Icons/AmbitionIcons/000003C70000022B.png",
    "crusader": "/rbbp/Icons/AmbitionIcons/000004AC00000071.png",
    "duelist": "/rbbp/Icons/AmbitionIcons/000004AC00000070.png",
    "shepherd": "/rbbp/Icons/AmbitionIcons/000004AC0000006F.png",
    "pirate": "/rbbp/Icons/AmbitionIcons/000004AC0000006E.png",  # EN: Privateer
    "warhero": "/rbbp/Icons/AmbitionIcons/000004AC0000006D.png",  # EN: Challenger
    "imperialist": "/rbbp/Icons/AmbitionIcons/000004AC0000006C.png",
    "digger": "/rbbp/Icons/AmbitionIcons/000004AC0000006B.png",  # EN: Delver
    "tyrant": "/rbbp/Icons/AmbitionIcons/000004AC0000006A.png",  # EN: Fearmonger
    "lawkeeper": "/rbbp/Icons/AmbitionIcons/000004AC00000069.png",  # EN: Lawbringer
    "collector": "/rbbp/Icons/AmbitionIcons/000004AC00000068.png",
    "explorer": "/rbbp/Icons/AmbitionIcons/000004AC00000067.png",
    "seneschal": "/rbbp/Icons/AmbitionIcons/000004AC00000066.png",  # EN: Steward
    "conqueror": "/rbbp/Icons/AmbitionIcons/000004AC00000065.png",
}

CODE_RE = re.compile(r"\[([a-zA-Z]+)\]")


def esc(text):
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def sub_codes(text):
    """Заменяет [code] на реальную иконку. Неизвестные коды - снимает скобки (с предупреждением в stderr)."""

    def repl(m):
        code = m.group(1)
        if code in INLINE_TAG_CODES:
            tag = INLINE_TAG_CODES[code]
            return f"<{tag}></{tag}>"
        if code in PORTRAIT_CODES:
            return f'<img class="rbbp-inline-icon" src="{PORTRAIT_CODES[code]}">'
        print(f"ПРЕДУПРЕЖДЕНИЕ: неизвестный код [{code}], убираю скобки", file=sys.stderr)
        return code

    return CODE_RE.sub(repl, text)


def render_inline(text):
    """Инлайн-разметка: markdown-ссылки, **bold**, потом [code]."""
    text = esc(text)
    # markdown-ссылки [text](url) - делаем ДО замены [code], чтобы не спутать
    text = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        r'<a href="\2" target="_blank" rel="noopener">\1</a>',
        text,
    )
    # **bold**
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    # [code] -> иконка (после ссылок, чтобы не задеть их)
    text = sub_codes(text)
    return text


def render_list_items(items, i, indent):
    """Рекурсивно строит вложенный <ul> из плоского списка (indent, text),
    начиная с индекса i, пока уровень отступа не меньше indent.
    Вложенные <ul> кладутся ВНУТРЬ предыдущего <li> (валидная структура)."""
    out = ["<ul>"]
    while i < len(items) and items[i][0] >= indent:
        item_indent, text = items[i]
        if item_indent > indent:
            i += 1
            continue
        li = f"<li>{render_inline(text)}"
        i += 1
        if i < len(items) and items[i][0] > item_indent:
            nested_html, i = render_list_items(items, i, items[i][0])
            li += nested_html
        li += "</li>"
        out.append(li)
    out.append("</ul>")
    return "".join(out), i


def convert(md_text):
    lines = md_text.split("\n")
    out = []
    heading_id = 0

    def close_all_lists():
        # оставлено для симметрии со старой версией скрипта; сейчас списки
        # закрываются сами через render_list_items, эта функция - no-op
        pass

    i = 0
    while i < len(lines):
        raw = lines[i]
        line = raw.rstrip()

        if not line.strip():
            i += 1
            continue

        # заголовок: #, ##, ### (+ опциональный код [xxx] в начале текста)
        h_match = re.match(r"^(#{1,3})\s+(.*)$", line)
        if h_match:
            level = len(h_match.group(1))  # 1,2,3
            text = h_match.group(2).strip()
            tag = {1: "h2", 2: "h3", 3: "h4"}[level]
            heading_id += 1
            out.append(f'<{tag} id="rbbp-h{heading_id}">{render_inline(text)}</{tag}>')
            i += 1
            continue

        # markdown-таблица: | код | описание |  (плюс строка-разделитель |---|---|)
        if line.lstrip().startswith("|"):
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i].strip())
                i += 1
            out.append("<ul>")
            for tl in table_lines:
                cells = [c.strip() for c in tl.strip("|").split("|")]
                if len(cells) < 2:
                    continue
                if re.match(r"^-+$", cells[0]):
                    continue
                out.append(f"<li>{render_inline(cells[0])} — {render_inline(cells[1])}</li>")
            out.append("</ul>")
            continue

        # начало списка: (пробелы)- текст - собираем все подряд идущие строки списка
        # (пустые строки МЕЖДУ пунктами списка не прерывают его - в исходнике между
        # каждым пунктом стоит пустая строка), затем строим вложенность рекурсивно
        li_match = re.match(r"^(\s*)-\s+(.*)$", line)
        if li_match:
            items = []
            j = i
            while j < len(lines):
                cur = lines[j].rstrip()
                m = re.match(r"^(\s*)-\s+(.*)$", cur)
                if m:
                    items.append((len(m.group(1)), m.group(2).strip()))
                    j += 1
                    continue
                if not cur.strip():
                    # пустая строка - смотрим, идёт ли дальше ещё один пункт списка
                    k = j + 1
                    while k < len(lines) and not lines[k].strip():
                        k += 1
                    if k < len(lines) and re.match(r"^(\s*)-\s+(.*)$", lines[k].rstrip()):
                        j = k
                        continue
                break
            i = j
            html, _ = render_list_items(items, 0, items[0][0])
            out.append(html)
            continue

        # обычный абзац
        out.append(f"<p>{render_inline(line.strip())}</p>")
        i += 1

    return "\n".join(out)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    src = sys.argv[1]
    dst = sys.argv[2]
    with open(src, encoding="utf-8") as f:
        md = f.read()
    html = convert(md)

    leftover = re.findall(r"\[[^\]]*\]", html)
    if leftover:
        print(f"ПРЕДУПРЕЖДЕНИЕ: в итоговом HTML остались необработанные [скобки]: {leftover}", file=sys.stderr)

    with open(dst, "w", encoding="utf-8") as f:
        json.dump({"html": html}, f, ensure_ascii=False)
    print("OK ->", dst, "| длина html:", len(html))
