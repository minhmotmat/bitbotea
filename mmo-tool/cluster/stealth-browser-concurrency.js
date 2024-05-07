const builtInConcurrency = require("puppeteer-cluster/dist/concurrency/builtInConcurrency");
const { debugGenerator, timeoutExecute } = require("puppeteer-cluster/dist/util")
const debug = debugGenerator('BrowserConcurrency');
// console.log(builtInConcurrency)
// const debug = console.log;
const BROWSER_TIMEOUT = 5000;
class StealthBrowserConcurrency extends builtInConcurrency.Browser {
    async workerInstance(perBrowserOptions) {

        const options = perBrowserOptions || this.options;
        let chrome = await this.puppeteer.launch(options);
        let page;
        let context; // puppeteer typings are old...

        return {
            jobInstance: async () => {
                await timeoutExecute(BROWSER_TIMEOUT, (async () => {
                    context = await chrome.createIncognitoBrowserContext();
                    page = await context.newPage();
                })());

                return {
                    resources: {
                        page,
                    },

                    close: async () => {
                        await timeoutExecute(BROWSER_TIMEOUT, context.close());
                    },
                };
            },

            close: async () => {
                await chrome.close();
            },

            repair: async () => {
                debug('Starting repair');
                try {
                    // will probably fail, but just in case the repair was not necessary
                    await chrome.close();
                } catch (e) {}

                // just relaunch as there is only one page per browser
                chrome = await this.puppeteer.launch(options);
            },
        };
    }
}
exports.StealthBrowserConcurrency = StealthBrowserConcurrency;