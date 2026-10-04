// Скриншот места на странице RBBP: прокрутка к заголовку (h2/h3/h4) или к тексту.
//   node Tools/dev/rbbp_shot.js RU "Книга некромантии" out.png [RBBP.html]
//   node Tools/dev/rbbp_shot.js EN "Tome of Necromancy" out.png
// Заголовок ищется по вхождению подстроки; если не найден - по тексту <li>/<p>.
const { BASE, launch, openPage } = require("./launch");

(async () => {
    const [lang, needle, out, pageName = "RBBP.html"] = process.argv.slice(2);
    if (!lang || !needle || !out) {
        console.error('usage: node rbbp_shot.js <RU|EN> "<текст заголовка>" <out.png> [страница.html]');
        process.exit(2);
    }
    const browser = await launch();
    const { ctx, page } = await openPage(browser, lang, `${BASE}/${pageName}`);
    const top = await page.evaluate((n) => {
        const sel = "#rbbpContent h2,#rbbpContent h3,#rbbpContent h4,#rbbpContent li,#rbbpContent p";
        const el = [...document.querySelectorAll(sel)].find((x) => x.textContent.includes(n));
        return el ? el.getBoundingClientRect().top + scrollY : null;
    }, needle);
    if (top === null) {
        console.error("NOT FOUND:", needle);
        await browser.close();
        process.exit(1);
    }
    await page.evaluate((t) => scrollTo(0, t - 40), top);
    await new Promise((r) => setTimeout(r, 300));
    await page.screenshot({ path: out });
    console.log("saved", out);
    await ctx.close();
    await browser.close();
})();
