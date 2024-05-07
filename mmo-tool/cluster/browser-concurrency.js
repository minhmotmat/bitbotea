const builtInConcurrency = require("puppeteer-cluster/dist/concurrency/builtInConcurrency");
const { debugGenerator, timeoutExecute } = require("puppeteer-cluster/dist/util")
const debug = debugGenerator('BrowserConcurrency');
// console.log(builtInConcurrency)
// const debug = console.log;
const BROWSER_TIMEOUT = 5000;
class BrowserConcurrency extends builtInConcurrency.Browser {
    async createNewChrome(options) {
        if (options.userDataDir) {
            this.puppeteer.useProfile(options.userDataDir);
        }
        if (options.proxy) {
            this.puppeteer.useProxy(options.proxy)
        }
        if (options.fingerPrint) {
            this.puppeteer.useFingerprint(options.fingerPrint)
        }
        return await this.puppeteer.launch(options);;
    }
    async workerInstance(perBrowserOptions) {

        const options = perBrowserOptions || this.options;
        console.log('createNewChrome')
        let chrome = await this.createNewChrome(options);
        console.log('done createNewChrome')
        let page;
        // let context; // puppeteer typings are old...

        return {
            jobInstance: async () => {
                console.log('jobInstance')
                await timeoutExecute(BROWSER_TIMEOUT, (async () => {
                    let pages = await chrome.pages()
                    if (pages.length > 0) {
                        console.log('return default page')
                        page = pages[0];
                    } else {
                        // context = await chrome.createIncognitoBrowserContext();
                        page = await chrome.newPage();
                        console.log('jobInstance/creat new page')
                    }
                })());

                return {
                    resources: {
                        page,
                    },

                    close: async () => {
                        debug('jobInstance/close')
                        // await timeoutExecute(BROWSER_TIMEOUT, chrome.close());
                    },
                };
            },

            close: async () => {
                console.log('close')
                if (chrome && !options.isKeepRunning) {
                    await chrome.close();
                    console.log('close chrome success')
                }
            },

            repair: async () => {
                console.log('Starting repair');
                try {
                    // will probably fail, but just in case the repair was not necessary
                    await chrome.close();
                } catch (e) {
                    console.log('error close chrome')
                }

                // just relaunch as there is only one page per browser
                chrome = await this.createNewChrome(options)
            },
        };
    }
}
exports.BrowserConcurrency = BrowserConcurrency;