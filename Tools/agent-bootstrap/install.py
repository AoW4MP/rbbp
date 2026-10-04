#!/usr/bin/env python3
"""Развёртывание окружения агента (Claude Code) для этого репозитория на новой машине.

Запуск из корня репо (Windows: `python`, Linux/macOS: `python3`):

    python Tools/agent-bootstrap/install.py             # память + локальные настройки проекта + проверка зависимостей
    python Tools/agent-bootstrap/install.py --smoke      # то же + проверка конвертера/чистильщика/верификатора
    python Tools/agent-bootstrap/install.py --npm        # то же + `npm install` в Tools/dev
    python Tools/agent-bootstrap/install.py --user-settings   # ещё и добавить плагины в ~/.claude/settings.json (опционально)
    python Tools/agent-bootstrap/install.py --force      # перезаписать уже существующие файлы памяти/настроек

Ничего не удаляет и по умолчанию не перезаписывает существующие файлы. Токены/пароли не трогает.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass
os.environ.setdefault("PYTHONUTF8", "1")  # дочерние python-скрипты тоже пишут UTF-8 (важно для Windows-консоли)

HERE = Path(__file__).resolve().parent
REPO = HERE.parent.parent
OK, BAD, WARN = "[ ok ]", "[FAIL]", "[warn]"


def claude_home() -> Path:
    return Path(os.environ.get("CLAUDE_CONFIG_DIR") or (Path.home() / ".claude"))


def project_folder_name(path: Path) -> str:
    """Имя папки проекта в ~/.claude/projects: каждый не-алфавитно-цифровой символ пути -> '-'.
    /home/lyas/AoW4_RbbP_Wiki -> -home-lyas-AoW4-RbbP-Wiki ; C:\\Users\\x\\work\\AoW4_RbbP_Wiki -> C--Users-x-work-AoW4-RbbP-Wiki"""
    return re.sub(r"[^A-Za-z0-9]", "-", str(path))


def run(cmd, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace", **kw)


def check_prereqs() -> bool:
    print("\n== Зависимости ==")
    hints = {
        "git": "winget install --id Git.Git -e",
        "node": "winget install --id OpenJS.NodeJS.LTS -e",
        "npm": "(ставится вместе с Node)",
        "pandoc": "winget install --id JohnMacFarlane.Pandoc -e",
        "gh": "winget install --id GitHub.cli -e",
    }
    ok = True
    for tool, hint in hints.items():
        path = shutil.which(tool)
        if path:
            ver = (run([path, "--version"]).stdout or "").splitlines()[:1]
            print(f"{OK} {tool}: {ver[0] if ver else path}")
        else:
            ok = False
            print(f"{BAD} {tool} не найден -> {hint}")
    print(f"{OK} python: {sys.version.split()[0]} ({sys.executable})")
    if shutil.which("gh"):
        r = run(["gh", "auth", "status"])
        if r.returncode == 0:
            print(f"{OK} gh авторизован")
        else:
            ok = False
            print(f"{BAD} gh не авторизован -> выполнить `gh auth login` (делает владелец) и `gh auth setup-git`")
    return ok


def check_git_config():
    print("\n== Настройки git ==")
    autocrlf = (run(["git", "config", "--get", "core.autocrlf"], cwd=REPO).stdout or "").strip()
    print(f"{OK if autocrlf in ('input', 'false') else WARN} core.autocrlf = {autocrlf or '<не задан>'} (нужно `input`)")
    sample = REPO / "RBBP_doc_7.md"
    if sample.exists() and b"\r\n" in sample.read_bytes():
        print(f"{BAD} в рабочей копии CRLF (RBBP_doc_7.md) - скрипты с regex ^...$ будут ломаться.")
        print("       Исправить: `git config core.autocrlf input`, затем при ЧИСТОМ дереве: `git rm --cached -r . && git reset --hard`")
    else:
        print(f"{OK} окончания строк LF")
    for k in ("user.name", "user.email"):
        v = (run(["git", "config", "--get", k], cwd=REPO).stdout or "").strip()
        print(f"{OK if v else WARN} {k} = {v or '<не задан>'}")
    if os.name == "nt":
        print("       Windows: перед работой `set PYTHONUTF8=1` (PowerShell: $env:PYTHONUTF8=1), иначе кириллица в выводе Python падает.")


def merge_memory_index(src: Path, dst: Path):
    existing = dst.read_text(encoding="utf-8") if dst.exists() else "# Memory Index\n\n"
    add = []
    for line in src.read_text(encoding="utf-8").splitlines():
        m = re.match(r"- \[[^\]]+\]\(([^)]+)\)", line)
        if m and m.group(1) not in existing:
            add.append(line)
    if add:
        dst.write_text(existing.rstrip("\n") + "\n" + "\n".join(add) + "\n", encoding="utf-8", newline="\n")
    return len(add)


def install_memory(force: bool, claude_dir: Path):
    target = claude_dir / "projects" / project_folder_name(REPO) / "memory"
    print(f"\n== Память Claude -> {target} ==")
    target.mkdir(parents=True, exist_ok=True)
    for f in sorted((HERE / "memory").glob("*.md")):
        dst = target / f.name
        if f.name == "MEMORY.md":
            n = merge_memory_index(f, dst)
            print(f"{OK} MEMORY.md: добавлено записей индекса: {n}")
        elif dst.exists() and not force:
            print(f"{WARN} {f.name}: уже есть, пропущено (--force чтобы перезаписать)")
        else:
            shutil.copyfile(f, dst)
            print(f"{OK} {f.name}")
    print("   (Если имя папки проекта у Claude Code окажется другим - см. ~/.claude/projects/ после первого запуска `claude` здесь\n"
          "    и перенесите папку memory/ вручную.)")


def install_project_settings(force: bool):
    dst = REPO / ".claude" / "settings.local.json"
    print(f"\n== Локальные разрешения проекта -> {dst} ==")
    if dst.exists() and not force:
        print(f"{WARN} уже существует, пропущено (--force чтобы перезаписать)")
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(HERE / "settings" / "project-settings.local.json", dst)
    print(f"{OK} установлено (без git push / gh pr create / gh pr merge - они идут только после «мерж» владельца)")


def install_user_settings(claude_dir: Path):
    dst = claude_dir / "settings.json"
    print(f"\n== Пользовательские настройки (плагины) -> {dst} ==")
    add = json.loads((HERE / "settings" / "user-settings.merge.json").read_text(encoding="utf-8"))
    cur = json.loads(dst.read_text(encoding="utf-8")) if dst.exists() else {}
    if dst.exists():
        shutil.copyfile(dst, dst.with_suffix(".json.bak"))
    changed = []
    for key, val in add.items():
        if isinstance(val, dict):
            cur.setdefault(key, {})
            for k2, v2 in val.items():
                if k2 not in cur[key]:
                    cur[key][k2] = v2
                    changed.append(f"{key}.{k2}")
        elif key not in cur:
            cur[key] = val
            changed.append(key)
    claude_dir.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(cur, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    print(f"{OK} добавлено: {', '.join(changed) or 'ничего нового'} (резервная копия: settings.json.bak)")
    print("   При следующем запуске Claude Code может предложить установить плагины - для проекта они необязательны.")


def npm_install():
    print("\n== npm install (Tools/dev) ==")
    env = dict(os.environ)
    r = subprocess.run(["npm", "install", "--no-audit", "--no-fund"], cwd=REPO / "Tools" / "dev", env=env, shell=(os.name == "nt"))
    print(f"{OK if r.returncode == 0 else BAD} npm install -> код {r.returncode}"
          + ("" if r.returncode == 0 else " (если не качается Chrome: PUPPETEER_SKIP_DOWNLOAD=true и CHROME_PATH=путь к chrome)"))


def smoke() -> bool:
    print("\n== Smoke-тест ==")
    py = sys.executable
    ok = True
    tmp = Path(tempfile.mkdtemp(prefix="rbbp_smoke_"))
    # 1. конвертер даёт побайтово тот же JSON
    for lang, md in (("RU", "RBBP_doc_7.md"), ("EN", "RBBP_doc_7_EN.md")):
        out = tmp / f"{lang}.json"
        r = run([py, "Tools/rbbp_convert_doc.py", md, str(out)], cwd=REPO)
        same = r.returncode == 0 and out.exists() and out.read_bytes() == (REPO / "Data" / lang / "RBBP.json").read_bytes()
        ok &= same
        print(f"{OK if same else BAD} конвертер {md} -> JSON совпадает с Data/{lang}/RBBP.json")
    # 2. чистильщик воспроизводит RBBP_doc_7.md из фикстуры
    fixture = REPO / "Tools" / "dev" / "fixtures" / "RBBP_doc_29092026.docx"
    if shutil.which("pandoc") and fixture.exists():
        out = tmp / "clean.md"
        r = run([py, "Tools/dev/rbbp_clean_docx.py", str(fixture), str(out)], cwd=REPO)
        norm = lambda p: [l.rstrip() for l in Path(p).read_text(encoding="utf-8").splitlines() if l.strip()]
        same = r.returncode == 0 and norm(out) == norm(REPO / "RBBP_doc_7.md")
        ok &= same
        print(f"{OK if same else BAD} rbbp_clean_docx: фикстура docx -> markdown идентичен RBBP_doc_7.md")
    else:
        print(f"{WARN} чистильщик пропущен (нет pandoc или фикстуры)")
    # 3. верификатор пары RU/EN
    r = run([py, "Tools/dev/rbbp_verify.py", "RBBP_doc_7.md", "RBBP_doc_7_EN.md"], cwd=REPO)
    same = r.returncode == 0
    ok &= same
    print(f"{OK if same else BAD} rbbp_verify: заголовки/коды/маркеры RU-EN согласованы")
    if not same:
        print(r.stdout[-800:])
    shutil.rmtree(tmp, ignore_errors=True)
    print("\nБраузерная регрессия (нужен npm install и запущенный сервер):\n"
          "   python Tools/dev/serve.py 8811    # в отдельном окне\n"
          "   node Tools/dev/rbbp_check.js      # ожидается: EN OK handlers 492, RU OK handlers 549, код 0")
    return ok


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--force", action="store_true", help="перезаписывать существующие файлы памяти/настроек")
    ap.add_argument("--user-settings", action="store_true", help="добавить плагины в ~/.claude/settings.json")
    ap.add_argument("--npm", action="store_true", help="выполнить npm install в Tools/dev")
    ap.add_argument("--smoke", action="store_true", help="прогнать проверки конвертера/чистильщика/верификатора")
    ap.add_argument("--claude-dir", help="каталог конфигурации Claude (по умолчанию ~/.claude или $CLAUDE_CONFIG_DIR)")
    a = ap.parse_args()

    print(f"Репозиторий: {REPO}")
    claude_dir = Path(a.claude_dir) if a.claude_dir else claude_home()
    deps_ok = check_prereqs()
    check_git_config()
    install_memory(a.force, claude_dir)
    install_project_settings(a.force)
    if a.user_settings:
        install_user_settings(claude_dir)
    if a.npm:
        npm_install()
    smoke_ok = smoke() if a.smoke else True
    print("\n== Итог ==")
    print(f"{OK if deps_ok else WARN} зависимости {'в порядке' if deps_ok else 'неполные (см. выше)'}")
    if a.smoke:
        print(f"{OK if smoke_ok else BAD} smoke-тест {'пройден' if smoke_ok else 'ЕСТЬ ОШИБКИ'}")
    print("Дальше: запустить `claude` в этой папке и вставить Tools/agent-bootstrap/PROMPT_FOR_NEW_AGENT.txt")
    return 0 if (deps_ok and smoke_ok) else 1


if __name__ == "__main__":
    sys.exit(main())
