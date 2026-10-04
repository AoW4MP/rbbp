# Tools/dev — инструменты для работы со страницей RBBP

Не часть сайта (GitHub Pages отдаёт их как статику, но на них ничего не ссылается). Раньше всё это жило во
временной папке сессии и пропадало после каждого сброса контекста — теперь лежит в репозитории.
Работает на Linux/macOS/Windows (`python` вместо `python3` на Windows).

## Установка (один раз)

```bash
cd Tools/dev
npm install                      # puppeteer (скачивает свой Chrome) + docx
# если Chrome скачать нельзя: PUPPETEER_SKIP_DOWNLOAD=true npm install  и задать CHROME_PATH=путь/к/chrome(.exe)
```
Нужны: Python 3.9+, Node 18+, pandoc (только для `rbbp_clean_docx.py`).
На Windows перед работой: `set PYTHONUTF8=1` (иначе вывод кириллицы в консоль падает).

## Типовой цикл публикации нового черновика (подробности — CLAUDE.md, раздел 8)

```bash
# 1. docx мейнтейнера -> чистый RU markdown (все повторяющиеся правки автоматически)
python Tools/dev/rbbp_clean_docx.py RBBP_doc_DDMMYYYY.docx RBBP_doc_N.md
diff RBBP_doc_N-1.md RBBP_doc_N.md          # посмотреть, что реально нового — перевести это на EN вручную
# 2. после перевода: RBBP_doc_N_EN.md; сверка пары
python Tools/dev/rbbp_verify.py RBBP_doc_N.md RBBP_doc_N_EN.md RBBP_doc_N-1.md
# 3. сборка JSON
python Tools/rbbp_convert_doc.py RBBP_doc_N.md    Data/RU/RBBP.json
python Tools/rbbp_convert_doc.py RBBP_doc_N_EN.md Data/EN/RBBP.json
# 4. тест в браузере + скриншоты для владельца
python Tools/dev/serve.py 8811 &                  # http://localhost:8811/rbbp/HTML/RBBP.html
node Tools/dev/rbbp_check.js                      # 0 = чисто на RU и EN
node Tools/dev/rbbp_shot.js RU "Книга некромантии" shot.png
# 5. исправленный docx обратно мейнтейнеру (чтобы он влил правки в мастер-файл)
node Tools/dev/build_docx.js RBBP_doc_N.md RBBP_doc_N_fixed.docx
```

## Файлы

| Файл | Назначение |
|---|---|
| `serve.py` | статический сервер с префиксом `/rbbp/` без симлинков (порт 8811) |
| `rbbp_clean_docx.py` | docx -> markdown + ВСЕ повторяющиеся правки экспорта (коды иконок, опечатки имён, артефакты pandoc) |
| `rbbp_verify.py` | паритет RU/EN: уровни заголовков, последовательность `[код]`, резолв `{{}}`, нерезолвящиеся `(Name)` |
| `rbbp_check.js` | Puppeteer-регрессия страницы на RU и EN (код возврата 1 при проблемах) |
| `rbbp_shot.js` | скриншот места на странице по тексту заголовка |
| `build_docx.js` | markdown -> docx для мейнтейнера |
| `launch.js` | общий запуск браузера (`CHROME_PATH`, `RBBP_BASE`) |
| `fixtures/RBBP_doc_29092026.docx` | эталонный черновик: `rbbp_clean_docx.py` на нём должен воспроизвести `RBBP_doc_7.md` (проверяется `Tools/agent-bootstrap/install.py --smoke`) |

## Что нужно обновлять вручную

- `rbbp_verify.py` держит Python-реплику индекса сущностей из `HTML/RBBP.html` (`BuildRbbpEntityIndexByEnglishName`).
  Если в JS добавляется категория / меняется `RBBP_EXCLUDED_EN_NAMES` / `RBBP_ITEM_NAMES` /
  `RBBP_UNIT_TYPE_ICONS` / `RBBP_CITY_TIER_STRUCTURES` — обновить константы и `build_index()` здесь.
- `rbbp_clean_docx.py`: новые повторяющиеся ошибки мейнтейнера дописывать в `NAME_FIXES` / `HEADING_CODES`.
