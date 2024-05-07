
import fs from 'node:fs';
import path from 'node:path';
const { plugin } = require('puppeteer-with-fingerprints');
import Scripting from './Scripting';
import { downloadFingerPrint } from './fingerprint-utils';
const fsExtra = require('fs-extra');
// const puppeteer = require('puppeteer-extra')
// const { PuppeteerExtraPlugin } = require('puppeteer-extra-plugin')
export default class Manager {
    dataFolder: string;
    profileConfigPath: string;
    profiles;
    profileFolder: string;
    fingerCanvaFolder: string;
    scriptingFolder: string;
    viewPort: any;
    isLoadFingerPrint: boolean;
    headless: boolean;
    proxyFolder: string;
    proxyData: any;
    proxyFilePath: string;
    executablePath: any;
    isUsedProxy: boolean;
    puppeteer: any
    constructor(dataFolder: string, isLoadFingerPrint = true, viewPort = null,
        headless = false, executablePath = null, isUsedProxy = true, puppeteer: any) {

        this.dataFolder = dataFolder
        if (!fs.existsSync(this.dataFolder)) {
            fs.mkdirSync(this.dataFolder);
        }
        this.profileConfigPath = path.join(dataFolder, "/profiles.json");
        this.profiles = this.__loadProfilesData();
        this.profileFolder = path.join(dataFolder, "/profiles");
        if (!fs.existsSync(this.profileFolder)) {
            fs.mkdirSync(this.profileFolder);
        }
        this.fingerCanvaFolder = path.join(dataFolder, "/fingerprint-canva");

        if (!fs.existsSync(this.fingerCanvaFolder)) {
            fs.mkdirSync(this.fingerCanvaFolder);
        }
        this.scriptingFolder = path.join(dataFolder, "/scripting");
        if (!fs.existsSync(this.scriptingFolder)) {
            fs.mkdirSync(this.scriptingFolder);
        }
        this.viewPort = viewPort;
        this.isLoadFingerPrint = isLoadFingerPrint;
        this.headless = headless;
        this.proxyFolder = path.join(dataFolder, "/proxy");
        if (!fs.existsSync(this.proxyFolder)) {
            fs.mkdirSync(this.proxyFolder);
        }
        this.proxyData = [];
        this.proxyFilePath = path.join(this.proxyFolder, 'proxy.json');
        this.executablePath = executablePath;
        this.isUsedProxy = isUsedProxy
        this.puppeteer = puppeteer;
    }
    setIsUsedProxy(value: boolean) {
        this.isUsedProxy = value;
    }
    __loadProfilesData() {
        let ps;
        if (!fs.existsSync(this.profileConfigPath)) {
            ps = { "profiles": {}, "proxy": { "usded": [] }, "fingerprint": { "used": [] } };
            fs.writeFileSync(this.profileConfigPath, JSON.stringify(ps));
            return ps;
        }
        ps = JSON.parse(fs.readFileSync(this.profileConfigPath, 'utf-8'));
        console.log("profiles object: ");
        console.log(ps);
        return ps;
    }
    __saveProfile() {
        console.log('save profile');
        fs.writeFileSync(this.profileConfigPath, JSON.stringify(this.profiles, null, '\t'));
    }
    createProfile(profileID: string) {
        if (this.profiles.profiles[profileID]) {
            console.error("profile already existing. Do you want to replace?");
            return;
        }
        this.profiles.profiles[profileID] = { "accounts": [] };
        this.__saveProfile();
        const profileDir = path.join(this.profileFolder, profileID);
        if (!fs.existsSync(profileDir)) {
            fs.mkdirSync(profileDir);
        }
    }
    getProfiles() {
        // console.log(`getProfiles: ${JSON.stringify(this.profiles)}`)
        return this.profiles.profiles
    }
    getAccountList(profileID: string) {
        return this.profiles.profiles[profileID];
    }
    async runAccounts(profileID: string, accountIDs: number[], scriptFileName: string) {
        for (let i = 0; i < accountIDs.length; ++i) {
            console.log(`rund profile ${profileID}, accountID: ${accountIDs[i]}`);
            await this.runAccount(profileID, accountIDs[i]);
            await this.runScript(profileID, accountIDs[i], scriptFileName);
            await this.profiles.profiles[profileID].accounts[accountIDs[i]].browser.close();
            this.profiles.profiles[profileID].accounts[accountIDs[i]].browser = null;
        }
        console.log('run complete')
    }
    async runAccount(profileID: string, accountID: number) {
        let userDir, fingerprint, proxy;

        [userDir, fingerprint, proxy] = this.getAccountConfig(profileID, accountID)
        if(proxy === "" || proxy === null || proxy === undefined) {
            this.setIsUsedProxy(false);
        } else {
            this.setIsUsedProxy(true);
        }
        const browser = await this.runPuppeteerWithFingerPrint(userDir, fingerprint, proxy)

        this.profiles.profiles[profileID].accounts[accountID].browser = browser;
    }
    async runPuppeteerWithFingerPrint(userDir: string, fingerprint: any, proxy: string) {
        plugin.useProfile(userDir);
        if (this.isLoadFingerPrint) {
            console.log('use finger print')
            plugin.useFingerprint(fingerprint);
        }
        if (this.isUsedProxy) {
            console.log('use proxy')
            plugin.useProxy(proxy, { changeBrowserLanguage: false });
        }
        return await plugin.launch({
            headless: this.headless
        });
    }
    getAccountConfig(profileID: string, accountID: number) {
        return [
            path.join(this.profileFolder, profileID, accountID + ''),
            this.getFingerPrintCanva(this.profiles.profiles[profileID].accounts[accountID].fingerprintID),
            this.profiles.profiles[profileID].accounts[accountID].proxy
        ]
    }


    closeBrowser(profileID: string, accountID: number) {
        this.profiles.profiles[profileID].accounts[accountID].browser.close();
        this.profiles.profiles[profileID].accounts[accountID].browser = null;
    }


    async runScript(profileID: string, accountID: number, scriptFileName: string) {
        const browser = this.profiles.profiles[profileID].accounts[accountID].browser;
        let page;
        const pages = await browser.pages();
        if (pages.length < 1) {
            page = await this.createNewPage(browser);
        } else {
            page = pages[0];
        }
        await page.setDefaultNavigationTimeout(0);
        const script = new Scripting(browser, page);
        script.loadFromFile(path.join(this.scriptingFolder, scriptFileName));
        await script.excute(this.profiles.profiles[profileID].accounts[accountID]);
    }
    async createNewPage(browser: any) {
        if (this.viewPort) {
            const page = await browser.newPage();
            await page.setViewport(this.viewPort);
            return page;

        } else {
            return await browser.newPage()
        }
    }
    loadProxyData() {
        try {
            if (fs.existsSync(this.proxyFilePath)) {
                this.proxyData = JSON.parse(fs.readFileSync(this.proxyFilePath, "utf-8"));
            } else {
                this.saveProxyData();
            }
        } catch (e) {
            console.log(e);
        }
    }
    addProxies(rawFilePath: string) {
        this.loadProxyData();
        const proxyList = fs.readFileSync(rawFilePath, 'utf-8').replaceAll('\r', '').split('\n');
        // console.log(proxyList)
        this.proxyData = [...this.proxyData, ...proxyList];
        this.saveProxyData();
    }
    saveProxyData() {
        fs.writeFileSync(this.proxyFilePath, JSON.stringify(this.proxyData));
    }
    addAccount(profileID: string, numAccounts: number, isUsedProxy = true, isUsedFingerPrint = true) {
        this.loadProxyData();
        if (!this.profiles.profiles[profileID]) {
            // this.profiles[profileID] = {
            //     accounts: []
            // }
            this.createProfile(profileID);
        }

        for (let i = 0; i < numAccounts; ++i) {
            const accountID = this.profiles.profiles[profileID].accounts.length;
            let fingerPrint;
            if (isUsedFingerPrint) {
                fingerPrint = this.profiles.fingerprint.used.length
                this.profiles.fingerprint.used.push(fingerPrint)
            } else {
                fingerPrint = '';
            }
            let proxyIndex, proxy;
            if (isUsedProxy) {
                proxyIndex = this.profiles.proxy.used.length;
                proxy = this.proxyData[proxyIndex]
                this.profiles.proxy.used.push(proxyIndex);

            } else {
                proxy = ''
            }
            this.profiles.profiles[profileID].accounts.push({
                "ID": accountID,
                "proxy": proxy,
                "scripting": "",
                "fingerprintID": fingerPrint + ""
            })
        }
        this.__saveProfile();
    }


    addXAccounts(profileID: string, xAccounts: any, startAccID: any) {
        for (let i = 0; i < xAccounts.length; ++i) {
            this.profiles.profiles[profileID].accounts[startAccID + i]['xaccount'] = {
                "username": xAccounts[i].username,
                "password": xAccounts[i].password
            }
        }
        this.__saveProfile()
    }
    getFingerPrintCanva(id: number) {
        const fingerFile = path.join(this.fingerCanvaFolder, id + '.json')
        if (fs.existsSync(fingerFile)) {
            return fs.readFileSync(fingerFile, 'utf-8');
        } else {
            return '';
        }
    }
    async downloadFingerPrint(num: number) {
        let curNumFile = fs.readdirSync(this.fingerCanvaFolder).length
        console.log(`current number fingerprint:  ${curNumFile}`);
        await downloadFingerPrint(this.fingerCanvaFolder, num, curNumFile);
    }
    clearAllFingerPrintData() {
        fsExtra.emptyDirSync(this.fingerCanvaFolder);
    }

    updateXAccountInfo(profileID: string, accountID: number, xAccountInfo: any) {
        this.__loadProfilesData();
        this.profiles.profiles[profileID].accounts[accountID].xaccount = xAccountInfo;
        this.__saveProfile();
    }

    // async runClusterAccounts(profileID, accounts, script) {
    //     // navigator.userAgent
    //     // navigator.webdriver
    //     //navigator.permissions
    //     // navigator.plugins
    //     // navigator.languages
    //     // {vendor: "Intel Minh.", renderer: "Intel(R) Iris(TM) Graphics 6100"}
    //     let accountID = accounts[0];
    //     let userDir, fingerprint, proxy;
    //     [userDir, fingerprint, proxy] = this.getAccountConfig(profileID, accountID)
    //     fingerprint = JSON.parse(fingerprint);
    //     const stealth = StealthPlugin();
    //     // Remove this specific stealth plugin from the default set
    //     // stealth.enabledEvasions.delete('navigator.vendor')
    //     puppeteer.use(stealth)
    //     // Stealth plugins are just regular `puppeteer-extra` plugins and can be added as such
    //     // const NavigatorVendorPlugin = require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor')
    //     // const nvp = NavigatorVendorPlugin({ vendor: `${fingerprint.attr["navigator.vendor"]}` }) // Custom vendor
    //     // puppeteer.use(nvp)
    //     puppeteer.use(pluginProxy({
    //         address: '64.137.108.193',
    //         port: 5786,
    //         credentials: {
    //             username: 'ekedemcf',
    //             password: 'fffkivcjim0w',
    //         }
    //     }));
    //     const browser = await puppeteer.launch({
    //         // executablePath: `C:/Users/vanmi/Downloads/Chrome-bin/chrome`,
    //         args: [
    //             '--no-sandbox',
    //             `--user-data-dir=${userDir}`,
    //             // `--proxy-server=${proxy}`
    //         ], headless: false
    //     })
    //     // console.log(browser)
    //     const page = await browser.newPage();
    //     // page.goto('https://bot.sannysoft.com/')
    //     page.goto('https://www.g2.com/products/asana/reviews?__cf_chl_tk=qWaP3HPcQBgNxI_Qk_DzsuMGOax5JzW9R7Z4r08Xu2s-1697861726-0-gaNycGzNDaU')

    // }

    getAllScripting() {
        const scriptingFiles = fs.readdirSync(this.scriptingFolder);
        return scriptingFiles
    }
    saveScripting(name: string, data: any) {
        fs.writeFileSync(path.join(this.scriptingFolder, name + '.json'), JSON.stringify(data, null, '\t'))
    }
}