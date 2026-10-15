// Локальный поиск по патчноутам RBBP (новые + архив старого формата) для HTML/RBBPPatchNotes.html.
// Нечувствителен к регистру и ё/е, терпим к окончаниям и опечаткам; результаты - фрагменты со ссылкой
// на версию и ближайший заголовок.
//   BuildRbbpPatchSearch({ lang, strings, loadPatches(lang, old), formatDate(iso), listWrap }) -> HTMLElement
(function () {
    // регистр, ё=е, всё кроме букв/цифр -> пробел
    function norm(s) {
        return s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/g, " ").trim();
    }

    function lev(a, b, max) {
        if (Math.abs(a.length - b.length) > max) return max + 1;
        let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
        for (let i = 1; i <= a.length; i++) {
            const cur = [i];
            for (let j = 1; j <= b.length; j++) {
                cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
            }
            prev = cur;
        }
        return prev[b.length];
    }

    // слово запроса t против слова блока w: 3 - подстрока, 2 - общий корень (окончания), 1 - опечатка, 0 - нет
    function wordScore(t, w) {
        if (w.includes(t)) return 3;
        if (t.length >= 4 && w.startsWith(t.slice(0, Math.max(3, t.length - 2)))) return 2;
        const max = t.length >= 8 ? 2 : t.length >= 5 ? 1 : 0;
        if (max && (lev(t, w, max) <= max || lev(t, w.slice(0, t.length), max) <= max)) return 1;
        return 0;
    }

    function ownText(el) {
        const c = el.cloneNode(true);
        c.querySelectorAll("ul, ol").forEach((n) => n.remove());
        // {{Name}} - маркер автоссылки EN-текста, на странице невидим
        return c.textContent.replace(/\{\{([^}]+)\}\}/g, "$1").replace(/\s+/g, " ").trim();
    }

    // блоки = заголовки, пункты списков и абзацы; для пункта хранится цепочка родительских пунктов
    function buildBlocks(patches, isOld, out) {
        for (const p of patches) {
            const doc = new DOMParser().parseFromString(p.html, "text/html");
            let headId = "";
            let headText = "";
            doc.body.querySelectorAll("h2, h3, h4, li, p").forEach((el) => {
                const text = ownText(el);
                if (!text) return;
                const isHeading = /^H[2-4]$/.test(el.tagName);
                if (isHeading) {
                    headId = el.id || "";
                    headText = text;
                }
                const ctx = [];
                for (let a = el.parentElement; a; a = a.parentElement) {
                    if (a.tagName === "LI") ctx.unshift(ownText(a));
                }
                out.push({
                    version: p.version,
                    date: p.date,
                    old: isOld,
                    headId,
                    headText,
                    isHeading,
                    text,
                    ctx: ctx.filter(Boolean),
                    norm: norm([headText, ...ctx, text].join(" ")).split(" "),
                    own: norm(text).split(" ")
                });
            });
        }
    }

    function search(blocks, query) {
        const tokens = norm(query).split(" ").filter(Boolean);
        if (!tokens.length) return { tokens, hits: [] };
        const run = (need) => {
            const hits = [];
            for (const b of blocks) {
                let total = 0;
                let matched = 0;
                for (const t of tokens) {
                    let best = 0;
                    for (const w of b.norm) {
                        const sc = wordScore(t, w);
                        if (sc > best) best = sc;
                        if (best === 3) break;
                    }
                    if (best) {
                        matched++;
                        total += best;
                    }
                }
                // совпадение должно быть и в собственном тексте блока, не только в контексте
                if (matched >= need && b.own.some((w) => tokens.some((t) => wordScore(t, w)))) {
                    hits.push({ b, score: total + (b.isHeading ? 1 : 0) });
                }
            }
            return hits;
        };
        let hits = run(tokens.length);
        // ничего не нашлось по всем словам - показываем блоки, где совпала хотя бы половина
        if (!hits.length && tokens.length > 1) hits = run(Math.ceil(tokens.length / 2));
        hits.sort((x, y) => y.score - x.score || y.b.date.localeCompare(x.b.date));
        return { tokens, hits };
    }

    function appendHighlighted(el, text, tokens) {
        for (const part of text.split(/([a-zA-Zа-яА-ЯёЁ0-9]+)/)) {
            if (!part) continue;
            const w = norm(part);
            if (w && tokens.some((t) => wordScore(t, w))) {
                const m = document.createElement("mark");
                m.textContent = part;
                el.appendChild(m);
            } else {
                el.appendChild(document.createTextNode(part));
            }
        }
    }

    const cache = {};
    function loadBlocks(lang, loadPatches) {
        if (!cache[lang]) {
            cache[lang] = Promise.all([loadPatches(lang, false), loadPatches(lang, true).catch(() => [])]).then(
                ([cur, old]) => {
                    const blocks = [];
                    buildBlocks(cur, false, blocks);
                    buildBlocks(old, true, blocks);
                    return blocks;
                }
            );
        }
        return cache[lang];
    }

    window.BuildRbbpPatchSearch = function (opts) {
        const { lang, strings, loadPatches, formatDate, listWrap } = opts;
        const MAX_HITS = 80;
        const wrap = document.createElement("div");
        wrap.className = "rbbp-search";
        const input = document.createElement("input");
        input.type = "search";
        input.placeholder = strings.searchPlaceholder;
        input.setAttribute("aria-label", strings.searchPlaceholder);
        const out = document.createElement("div");
        wrap.appendChild(input);
        wrap.appendChild(out);

        const render = async () => {
            const q = input.value.trim();
            out.innerHTML = "";
            listWrap.style.display = q ? "none" : "";
            if (!q) return;
            const blocks = await loadBlocks(lang, loadPatches);
            if (input.value.trim() !== q) return; // пользователь уже ввёл другое
            const { tokens, hits } = search(blocks, q);
            const info = document.createElement("div");
            info.className = "rbbp-search-count";
            out.appendChild(info);
            if (!hits.length) {
                info.textContent = strings.searchNone;
                return;
            }
            info.textContent =
                strings.searchCount + hits.length + (hits.length > MAX_HITS ? ". " + strings.searchMore + MAX_HITS : "");

            const groups = new Map();
            const seen = new Set();
            for (const h of hits) {
                if (groups.size && [...groups.values()].reduce((n, l) => n + l.length, 0) >= MAX_HITS) break;
                const dup = (h.b.old ? "o:" : "n:") + h.b.version + "|" + h.b.headId + "|" + h.b.text;
                if (seen.has(dup)) continue;
                seen.add(dup);
                const key = (h.b.old ? "o:" : "n:") + h.b.version;
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key).push(h.b);
            }
            for (const list of groups.values()) {
                const first = list[0];
                const base =
                    "/rbbp/HTML/RBBPPatchNotes.html?" +
                    (first.old ? "section=old&" : "") +
                    "version=" +
                    encodeURIComponent(first.version);
                const g = document.createElement("div");
                g.className = "rbbp-search-group";
                const title = document.createElement("a");
                title.href = base;
                title.textContent =
                    first.version + " (" + formatDate(first.date) + ")" + (first.old ? " · " + strings.searchOldBadge : "");
                g.appendChild(title);
                for (const b of list) {
                    const a = document.createElement("a");
                    a.className = "rbbp-search-hit";
                    a.href = base + (b.headId ? "#" + encodeURIComponent(b.headId) : "");
                    const trail = [b.isHeading ? "" : b.headText, ...b.ctx].filter(Boolean).join(" › ");
                    if (trail) {
                        const c = document.createElement("span");
                        c.className = "rbbp-search-ctx";
                        c.textContent = trail;
                        a.appendChild(c);
                    }
                    appendHighlighted(a, b.text, tokens);
                    g.appendChild(a);
                }
                out.appendChild(g);
            }
        };

        let timer = null;
        input.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(render, 200);
        });
        return wrap;
    };
})();
