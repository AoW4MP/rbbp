// Лёгкие превью иконок и ленивая загрузка для страниц RBBP.html / RBBPPatchNotes.html.
//
// Зачем: страница - один длинный документ с ~800 иконками, а оригиналы в Icons/ для
// мелких иконок избыточны (TomeIcons - 512px при показе 52px, ~600 КБ на файл). Плюс
// тултипы строятся для ВСЕХ сущностей сразу через innerHTML, и браузер качает их
// картинки немедленно, даже пока тултип не показан.
//
// Как: Icons/RbbpThumbs/<Папка>/<файл>.webp (128px) + Icons/RbbpThumbs/manifest.json со
// списком путей, для которых превью есть. Всё, чего в манифесте нет, остаётся оригиналом.
// Превью генерирует Tools/dev/rbbp_make_thumbs.js (после публикации нового документа
// запускать заново). Параметр ?nothumbs=1 отключает подмену (нужен самому генератору).
(function () {
    "use strict";

    const THUMB_ROOT = "/rbbp/Icons/RbbpThumbs/";
    let thumbSet = new Set();
    let manifestPromise = null;
    // ?nothumbs=1 - исходное поведение (оригиналы, без lazy): так генератор видит ВСЕ запросы
    const disabled = new URLSearchParams(location.search).has("nothumbs");

    function normalizeKey(path) {
        // "Icons/Interface//Header/x.png" -> "Interface/Header/x"
        return path.replace(/\/{2,}/g, "/").replace(/\.png$/i, "");
    }

    window.LoadRbbpThumbManifest = function () {
        if (manifestPromise) return manifestPromise;
        manifestPromise = (async () => {
            try {
                if (disabled) return;
                const res = await fetch(THUMB_ROOT + "manifest.json");
                if (!res.ok) return;
                thumbSet = new Set(await res.json());
            } catch (e) {
                // нет манифеста - работаем с оригиналами
            }
        })();
        return manifestPromise;
    };

    // Подмена пути одной иконки; возвращает исходную строку, если превью нет
    window.RbbpThumbUrl = function (src) {
        const m = /^(?:\/rbbp\/|\.\.\/|\/)?Icons\/(.+\.png)$/i.exec(src);
        if (!m) return src;
        const key = normalizeKey(m[1]);
        return thumbSet.has(key) ? THUMB_ROOT + key + ".webp" : src;
    };

    // Обрабатывает HTML-строку ДО вставки в DOM: подменяет src на превью и ставит
    // loading="lazy" decoding="async" (иначе браузер начнёт качать оригиналы сразу)
    window.RbbpOptimizeImgHtml = function (html) {
        if (disabled || typeof html !== "string" || html.indexOf("<img") === -1) return html;
        return html.replace(/<img\b([^>]*?)(\/?)>/gi, (tag, attrs, selfClose) => {
            let a = attrs;
            const srcMatch = /\bsrc=(["'])([^"']+)\1/i.exec(a);
            if (srcMatch) {
                const thumb = window.RbbpThumbUrl(srcMatch[2]);
                if (thumb !== srcMatch[2]) {
                    a = a.replace(srcMatch[0], 'src="' + thumb + '"');
                    if (!/\bonerror=/i.test(a)) {
                        a += ' onerror="this.onerror=null;this.src=\'' + srcMatch[2] + '\'"';
                    }
                }
            }
            if (!/\bloading=/i.test(a)) a += ' loading="lazy"';
            if (!/\bdecoding=/i.test(a)) a += ' decoding="async"';
            return "<img" + a + selfClose + ">";
        });
    };
})();
