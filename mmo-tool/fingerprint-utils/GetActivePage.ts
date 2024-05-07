export async function getActivePage  (browser: any, timeout=5000) {
    // reference: https://github.com/puppeteer/puppeteer/issues/443

    const start = new Date().getTime();
    while (new Date().getTime() - start < timeout) {
        const pages = await browser.pages();
        const arr = [];
        for (const p of pages) {
            if (await p.evaluate(() => { return document.visibilityState == 'visible' })) {
                arr.push(p);
            }
        }
        if (arr.length == 1) return arr[0];
    }
    throw "Unable to get active page";

}