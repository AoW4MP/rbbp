// Регрессия страницы RBBP на обоих языках. Код возврата 1, если что-то не так.
//   node Tools/dev/rbbp_check.js                 (сервер: python Tools/dev/serve.py)
// Проверяет: остатки {{маркеров}}, остатки [кодов] в тексте, битые картинки, JS-ошибки страницы.
const { BASE, launch, openPage } = require("./launch");

(async () => {
    const browser = await launch();
    let bad = false;
    for (const lang of ["EN", "RU"]) {
        const errs = [];
        const { ctx, page } = await openPage(browser, lang, `${BASE}/RBBP.html`);
        page.on("pageerror", (e) => errs.push(e.message));
        const r = await page.evaluate(() => {
            const a = document.getElementById("rbbpContent");
            const txt = a.innerText;
            return {
                leftoverMarkers: txt.match(/\{\{[^}]*\}\}/g) || [],
                leftoverBrackets: (txt.match(/\[[a-z0-9_%\-]+\]/gi) || []).slice(0, 10),
                handlers: a.querySelectorAll(".rbbpEntityHandler").length,
                links: a.querySelectorAll("a").length,
                brokenImgs: [...a.querySelectorAll("img")]
                    .filter((i) => i.complete && i.naturalWidth === 0)
                    .map((i) => i.getAttribute("src"))
                    .slice(0, 15)
            };
        });
        const ok = !r.leftoverMarkers.length && !r.leftoverBrackets.length && !r.brokenImgs.length && !errs.length;
        if (!ok) bad = true;
        console.log(`--- ${lang} ${ok ? "OK" : "PROBLEM"}`, JSON.stringify(r), "pageerrors:", errs);
        await ctx.close();
    }
    await browser.close();
    process.exit(bad ? 1 : 0);
})();
