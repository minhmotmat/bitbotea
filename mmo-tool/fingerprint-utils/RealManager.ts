
import Manager from "./Manager"
export default class RealManager extends Manager {
    async runAccount(profileID: string, accountID: number) {
        let userDir, fingerprint, proxy;
        [userDir, fingerprint, proxy] = this.getAccountConfig(profileID, accountID)
        let browser;
        if(!this.puppeteer){
            browser = await this.runPuppeteerWithFingerPrint(userDir, fingerprint, proxy)
        } else {
            browser = await this.puppeteer.launch({
                headless: false,
                executablePath: this.executablePath,
                ignoreDefaultArgs : true,
                args:
                [
                  `--user-data-dir=${userDir}`,
                  '--disable-background-networking',
                  '--disable-background-timer-throttling',
                  '--disable-client-side-phishing-detection',
                  '--disable-default-apps',
                  '--disable-dev-shm-usage',
                //   '--disable-extensions',
                  '--disable-hang-monitor',
                  '--disable-popup-blocking',
                  '--disable-prompt-on-repost',
                  '--disable-sync',
                  '--disable-translate',
                  '--metrics-recording-only',
                  '--no-first-run',
                  '--safebrowsing-disable-auto-update',
                ]
              }); 
        }
        this.profiles[profileID].accounts[accountID].browser = browser;
    }
}