# Переезд на новую машину (Windows 11, агент Claude Code + desktop-приложение на одной VM)

Всё, что нужно, лежит в этом репозитории — достаточно `git clone`. Здесь: память Claude, шаблоны настроек, стартовый
промпт и установщик `install.py`, который сам вычисляет пути под вашу ОС. Контекст проекта — в `CLAUDE.md` (разделы 8–9).

Рабочая папка на новой машине: `C:\Users\cloude-agent\work\AoW4_RbbP_Wiki`.

## Что где живёт

| Что | Где | Как попадает на новую машину |
|---|---|---|
| Код, данные, история | GitHub `AoW4MP/rbbp` | `git clone` |
| Накопленный контекст проекта, договорённости, терминология, открытые пункты | `CLAUDE.md` | клон; агент читает автоматически |
| Память Claude (правила общения/работы) | `Tools/agent-bootstrap/memory/` | `install.py` копирует в `~/.claude/projects/<папка-проекта>/memory/` |
| Разрешения проекта для агента | `Tools/agent-bootstrap/settings/` | `install.py` → `.claude/settings.local.json` |
| Инструменты тестов и конвертации | `Tools/dev/` | клон; `npm install` |
| Эталон для проверки (docx 29.09) | `Tools/dev/fixtures/` | клон |
| Токены и пароли | — | **не переносятся**, авторизация заново |
| История старой сессии (96 МБ) | старый сервер | **не переносим** — привязана к Linux-путям; ценное вынесено в `CLAUDE.md`/память/инструменты |

## Шаги

### 1. Установить ПО (PowerShell от администратора)
```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Python.Python.3.12 -e
winget install --id JohnMacFarlane.Pandoc -e
winget install --id GitHub.cli -e
```
Перезапустить терминал. Claude Code на Windows использует Git Bash (идёт с Git for Windows).

### 2. Настроить git ДО клонирования (важно)
```powershell
git config --global user.name  "Lyas"
git config --global user.email "lyasik7@gmail.com"
git config --global core.autocrlf input   # иначе CRLF в рабочей копии ломает regex ^…$ в скриптах
git config --global core.longpaths true
setx PYTHONUTF8 1                          # затем перезапустить терминал
```

### 3. Авторизация GitHub (делает владелец, токены в чат не отправлять)
```powershell
gh auth login      # GitHub.com → HTTPS → браузер; аккаунт lyas77
gh auth setup-git
```

### 4. Клонировать
```powershell
mkdir C:\Users\cloude-agent\work -ErrorAction SilentlyContinue
git clone https://github.com/AoW4MP/rbbp.git C:\Users\cloude-agent\work\AoW4_RbbP_Wiki
```
Клон ≈ 0,5 ГБ (`Icons/` 427 МБ). Репозиторий проверен: нет имён, недопустимых в Windows, нет коллизий регистра.

### 5. Запустить установщик
```powershell
cd C:\Users\cloude-agent\work\AoW4_RbbP_Wiki
python Tools\agent-bootstrap\install.py --smoke --npm
# по желанию: --user-settings (добавит плагины в ~/.claude/settings.json), --force (перезаписать существующее)
```
Он проверит зависимости и `gh auth`, настройки git и окончания строк, установит память и разрешения проекта, выполнит
`npm install` и прогонит smoke-тест (конвертер даёт побайтово тот же JSON; чистильщик docx воспроизводит
`RBBP_doc_7.md`; RU/EN согласованы). В конце должно быть «smoke-тест пройден».

### 6. Запустить агента и дать стартовый промпт
```powershell
claude
```
Вставить содержимое `Tools/agent-bootstrap/PROMPT_FOR_NEW_AGENT.txt`. Агент прочитает правила, проверит память,
запустит сервер и браузерную регрессию, пришлёт тестовый скриншот и спросит про канал доставки файлов.

> Если память не подхватилась: имя папки проекта у Claude Code кодирует путь (`C--Users-cloude-agent-work-AoW4-RbbP-Wiki`).
> Установщик вычисляет его сам, но если после первого запуска в `%USERPROFILE%\.claude\projects\` появилась папка с другим
> именем — скопируйте в неё `memory\` вручную и перезапустите сессию.

## Особенности Windows

- `python3` нет — `python`/`py -3` (примеры в `CLAUDE.md` с `python3` читать так).
- Нет `pkill` и `/tmp`: остановка сервера — закрыть окно или `taskkill /F /PID <pid>`; временные файлы — `%TEMP%`.
- `localhost` теперь, возможно, открывается и у владельца (агент и приложение на одной VM) — проверить один раз (см. пункт 5 промпта).
- Не запускайте двух агентов одновременно с коммитами в `main`; старый сервер лучше «заморозить» после переезда.
- На старом сервере по желанию: `gh auth logout` и отозвать токен в GitHub → Settings → Developer settings.
