// Генератор превью иконок для страниц RBBP (см. Data/src/rbbp_thumbs.js).
//   python Tools/dev/serve.py 8811        (в отдельном окне)
//   node Tools/dev/rbbp_make_thumbs.js
// Открывает RBBP.html и все версии RBBPPatchNotes.html на RU и EN с ?nothumbs=1 (оригиналы,
// без lazy - видны все запросы, включая картинки тултипов), собирает пути Icons/**/*.png и
// для файлов крупнее MAX px кладёт превью .webp в Icons/RbbpThumbs/<путь>.webp, обновляя
// Icons/RbbpThumbs/manifest.json. Мелкие иконки (<= MAX) остаются оригиналами.
// Запускать заново после публикации нового документа (появляются новые иконки).
const fs = require("fs");
const path = require("path");
const { BASE, launch, openPage } = require("./launch");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(ROOT, "Icons", "RbbpThumbs");
const MANIFEST = path.join(OUT, "manifest.json");
const MAX = 128;
const QUALITY = 0.9;

function normalizeKey(p) {
    return p.replace(/\/{2,}/g, "/").replace(/\.png$/i, "");
}

(async () => {
    const versions = JSON.parse(
        fs.readFileSync(path.join(ROOT, "Data", "RU", "RBBPPatchNotes.json"), "utf8")
    ).patches.map((p) => p.version);

    const pages = [`${BASE}/RBBP.html?nothumbs=1`, `${BASE}/RBBPPatchNotes.html?nothumbs=1`];
    for (const v of versions) pages.push(`${BASE}/RBBPPatchNotes.html?version=${encodeURIComponent(v)}&nothumbs=1`);

    const browser = await launch();
    const urls = new Set();
    let util = null;

    for (const lang of ["RU", "EN"]) {
        for (const url of pages) {
            // openPage ждёт networkidle0, поэтому слушатель вешаем через контекст заранее
            const ctx = await browser.createBrowserContext();
            const page = await ctx.newPage();
            await page.evaluateOnNewDocument((l) => {
                localStorage.setItem("userSettings", JSON.stringify({ language: l }));
            }, lang);
            page.on("request", (r) => {
                const m = /\/rbbp\/Icons\/(.+\.png)$/i.exec(new URL(r.url()).pathname);
                if (m && !m[1].startsWith("RbbpThumbs/")) urls.add(normalizeKey(decodeURIComponent(m[1])));
            });
            await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });
            await new Promise((r) => setTimeout(r, 1000));
            if (!util) util = page;
            else await ctx.close();
            console.log(lang, url.replace(BASE, ""), "->", urls.size);
        }
    }

    // сжатие делаем в браузере (canvas), чтобы не тянуть native-зависимости
    const base = BASE.replace(/\/HTML$/, "");
    await util.goto(`${base}/Style/style.css`);
    fs.mkdirSync(OUT, { recursive: true });
    const manifest = new Set(fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : []);

    let made = 0,
        skippedSmall = 0,
        missing = 0,
        origBytes = 0,
        thumbBytes = 0;
    for (const key of [...urls].sort()) {
        const res = await util.evaluate(
            async (src, max, quality) => {
                const r = await fetch(src);
                if (!r.ok) return { missing: true };
                const blob = await r.blob();
                const bmp = await createImageBitmap(blob);
                const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
                if (scale === 1) return { small: true, size: blob.size };
                const w = Math.max(1, Math.round(bmp.width * scale));
                const h = Math.max(1, Math.round(bmp.height * scale));
                const c = new OffscreenCanvas(w, h);
                const g = c.getContext("2d");
                g.imageSmoothingEnabled = true;
                g.imageSmoothingQuality = "high";
                g.drawImage(bmp, 0, 0, w, h);
                const out = await c.convertToBlob({ type: "image/webp", quality });
                const buf = new Uint8Array(await out.arrayBuffer());
                let s = "";
                for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
                return { b64: btoa(s), size: blob.size };
            },
            `${base}/Icons/${key}.png`,
            MAX,
            QUALITY
        );
        if (res.missing) {
            missing++;
            console.log("  нет файла:", key);
            continue;
        }
        if (res.small) {
            skippedSmall++;
            continue;
        }
        const file = path.join(OUT, key + ".webp");
        fs.mkdirSync(path.dirname(file), { recursive: true });
        const data = Buffer.from(res.b64, "base64");
        fs.writeFileSync(file, data);
        manifest.add(key);
        made++;
        origBytes += res.size;
        thumbBytes += data.length;
    }
    await browser.close();

    fs.writeFileSync(MANIFEST, JSON.stringify([...manifest].sort()) + "\n");
    console.log(
        `иконок на страницах: ${urls.size}; превью создано: ${made}; мелких (оставлены): ${skippedSmall}; нет файла: ${missing}`
    );
    console.log(
        `оригиналы ${(origBytes / 1048576).toFixed(1)} МБ -> превью ${(thumbBytes / 1048576).toFixed(1)} МБ; в манифесте ${manifest.size}`
    );
})();
