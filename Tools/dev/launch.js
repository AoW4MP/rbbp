// Общий запуск браузера для rbbp_check.js / rbbp_shot.js.
// puppeteer (скачивает свой Chrome) -> иначе puppeteer-core + CHROME_PATH.
const BASE = process.env.RBBP_BASE || "http://localhost:8811/rbbp/HTML";

async function launch() {
    let pp;
    try {
        pp = require("puppeteer");
    } catch (e) {
        pp = require("puppeteer-core");
    }
    const opts = { headless: "new", args: ["--no-sandbox"] };
    if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
    return pp.launch(opts);
}

// Новая страница в чистом контексте с принудительно выбранным языком сайта (по умолчанию он EN).
async function openPage(browser, lang, url) {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.evaluateOnNewDocument((l) => {
        localStorage.setItem("userSettings", JSON.stringify({ language: l }));
    }, lang);
    await page.setViewport({ width: 900, height: 750 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1500));
    return { ctx, page };
}

module.exports = { BASE, launch, openPage };
