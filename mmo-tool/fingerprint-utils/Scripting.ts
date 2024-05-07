import fs from 'node:fs';
import createAct from './ActMap';
export default class Scripting {
    actions: any[];
    page: any;
    browser: any;

    constructor(browser: any, page: any) {
        this.actions = [];
        this.page = page;
        this.browser = browser;
    }
    addAction(a: any) {
        this.actions.push(a);
    }
    async excute(accountConfig: any) {
        for (let a of this.actions) {
            await a.act(this.page, accountConfig, this.browser);
        }
    }
    loadFromFile(path: string) {
        const config = JSON.parse(fs.readFileSync(path, 'utf-8'));
        console.log("config");
        console.log(config);
        this.clearAllActions();
        for (let a of config) {
            console.log("act element config");
            console.log(a);
            this.actions.push(createAct(a.nameID,"-1", a.args));
        }
        console.log('acts')
        console.log(this.actions);

    }
    clearAllActions() {
        this.actions = [];
    }

}


// class TypeAct extends Action {
//     constructor({ selector, text, options }) {
//         super();
//         this.selector = selector;
//         this.text = text;
//         this.options = options;
//         console.log("options")
//         console.log(this.options)
//     }
//     async act(page, accountConfig) {
//         await page.type(this.selector, this.text, this.options);
//     }
// }
// class ClickAct extends Action {

    
// }

// class WaitAct extends Action {
//     constructor({ time, random }) {
//         super();
//         console.log("WaitAct");
//         this.time = time;
//         this.random = random;
//     }
//     async act(page, accountConfig) {
//         let t = getRandom(this.time, this.random);
//         console.log('wait for: ' + t)
//         await page.waitForTimeout(t);
//     }
// }



   
        // console.log('ScrollAct.act')
        // for (let i = 0; i < this.maxScrolls; ++i) {
        //     await page.mouse.wheel({ deltaY: sample([1, 1, 1, 1, -1]) * this.delta });;
        //     await page.waitForTimeout(getRandom(this.delay, 1000));
        // }

        // await page.evaluate(async (maxScrolls, distance, delay) => {
        //     await new Promise((resolve) => {
        //         var totalHeight = 0;
        //         // var distance = 200;
        //         var scrolls = 0;  // scrolls counter
        //         var timer = setInterval(() => {
        //             var scrollHeight = document.body.scrollHeight;
        //             window.scrollBy(0, distance);
        //             totalHeight += distance;
        //             scrolls++;  // increment counter

        //             // stop scrolling if reached the end or the maximum number of scrolls
        //             if(totalHeight >= scrollHeight - window.innerHeight || scrolls >= maxScrolls){
        //                 clearInterval(timer);
        //                 resolve();
        //             }
        //         }, delay);
        //     });
        // },this.maxScrolls, this.distance, this.delay);  // pass maxScrolls to the function
    // }
// }


// class XAct extends Action {
//     constructor() {
//         super();
//         console.log("XAct");
//     }
//     async act(page, accountConfig) {
//         console.log("Please implement me");
//     }

//     isLiked() {
//         return Math.random() > 0.5;
//         // return true;
//     }
//     isRepost() {
//         return Math.random() > 0.5;
//         // return false;
//     }
//     isReply() {
//         return false;
//         // return Math.random() > 0.5;
//     }
//     async like(page, elementNode) {
//         const likeBtn = await elementNode.$x(XConfig.likeSelector)
//         if (likeBtn.length > 0) {
//             console.log('like');
//             await likeBtn[0].click();
//         } else {
//             console.log('not found likeBtn');
//         }
//     }
//     async repost(page, elementNode) {
//         const selectors = await elementNode.$x(XConfig.repostSelector);
//         if (selectors.length > 0) {
//             await selectors[0].click();
//             await page.waitForTimeout(1000);
//             const secSelector = await page.$x(XConfig.repostConfirmSelector);
//             if (secSelector.length > 0) {
//                 console.log('repost');
//                 await secSelector[0].click();
//             } else {
//                 console.error('not found Repost Confirm button');
//             }
//         } else {
//             console.error('not found Repost button');
//         }
//     }
//     async reply(page, elementNode, text) {
//         const selectors = await elementNode.$x(XConfig.replySelector);
//         if (selectors.length > 0) {
//             console.log('Reply');
//             await selectors[0].click();
//             await page.waitForTimeout(1000);
//             await page.keyboard.type(text, this.options);
//             await page.waitForTimeout(1000);
//             const secSelector = await page.$x(XConfig.replyConfirmSelector);
//             if (secSelector.length > 0) {
//                 secSelector[0].click();
//             } else {
//                 console.error('not found confirm replay button');
//             }

//         } else {
//             console.error('not found Reply button');
//         }
//     }
//     async surf(page, maxLikes, maxFollow, maxComment, maxRepost, currentLikes, currentFollows, currentComments, currentRepost) {
//         console.log("SurfTimeLineXAct")
//         await page.waitForTimeout(5000);
//         // console.log("hover notify")
//         // await page.hover(XConfigSelectorStr.notify);
//         // await page.waitForTimeout(1000);
//         const timelines = await page.$x(XConfig.timelineXSelector);
//         if (timelines.length > 0) {
//             for (let i = 0; i < timelines.length; ++i) {
//                 await timelines[i].hover();
//                 // check là ảnh hay video hay text thông thường
//                 // có hứng thú hay không
//                 // bật âm thanh video, tua video, dừng video 
//                 // like or comment or repost 
//                 // dừng lại bao lâu 
//                 // click xem profile, lướt feed của người đó , quyết định có follow hay không
//                 // quay lại main page 
//                 // đọc comment
//                 // like comment 
//                 // visit profile của người comment 
//                 // click new post nếu có 
//                 await page.waitForTimeout(getRandomInt(2500, 3500) + (this._isInterest() ? getRandomInt(3000, 3600) : 0));
//                 if (this.isLiked() && currentLikes < maxLikes) {
//                     await this.like(page, timelines[i]);
//                     ++currentLikes;
//                     await page.waitForTimeout(getRandomInt(1000, 2000))
//                 }
//                 if (this.isRepost() && currentRepost < maxRepost) {
//                     await this.repost(page, timelines[i]);
//                     ++currentRepost;
//                     await page.waitForTimeout(getRandomInt(1000, 2000))
//                 }
//                 if (this.isReply() && currentComments < maxComment) {
//                     await this.reply(page, timelines[i], 'chéo nào! anh em tôi rất khỏe nhé!');
//                     ++currentComments;
//                     await page.waitForTimeout(getRandomInt(1000, 2000))
//                 }
//                 if (this._isMoreInterest()) {
//                     console.log('more interest');
//                     let tlc = await timelines[i].$x(XConfig.tlpClick);
//                     if (tlc.length > 0) {
//                         await tlc[0].click();
//                         await this.scrollDown(page, 8, 400, 1000);
//                         await page.waitForTimeout(1000 + getRandomInt(4500, 5500));
//                         if (this._isMoreInterest()) {
//                             console.log('more more interest');
//                             await this.clickBack(page);
//                         } else {
//                             await this.clickBack(page);
//                         }
//                     } else {
//                         console.log('cannot click timeline post');
//                     }
//                     break;
//                 }
//             }
//         } else {
//             console.log('no time lines');
//         }
//     }

// }

// const XConfig = {
//     "loginURL": 'https://twitter.com/i/flow/login',
//     "likeSelector": `//div[@data-testid="like"]`,
//     "repostSelector": `//div[@data-testid="retweet"]`,
//     "repostConfirmSelector": `//div[@data-testid="retweetConfirm"]`,
//     "replySelector": `//div[@data-testid="reply"]`,
//     "replyConfirmSelector": `//div[@data-testid="tweetButton"]`,
//     "followSelector": `//div[@role='button']//span[text()='Follow']`,
//     "userNameXLoginSelector": `//input[@autocomplete="username"]`,
//     "userNameNexBtnXLoginSelector": `//div[@role='button']//span[text()='Next']`,
//     "passwordXLoginSelector": `//input[@name="password"]`,
//     "loginBtnXLoginSelector": `//div[@role='button']//span[text()='Log in']`,
//     "timelineXSelector": `//div[@aria-label="Timeline: Your Home Timeline"]/div/div[position()>1]`,
//     "timelineConservation": `//div[@aria-label="Timeline: Conversation"]/div/div//div[@data-testid="tweetText"]`,
//     "tlpClick": '//div/div/article/div/div/div[last()]/div[1]',
//     "barback": '//div[@data-testid="app-bar-back"]',
//     "chooseDiffMethod": `//span[text()="Choose a different verification method"]`,
//     "useBackupCode": `//div[@role="radiogroup"]/div/label[last()]/div[last()]`,
//     "useBackupCodeNextBtn": `//div[@role='button']/div//span[text()='Next']`,
//     "backupCodeInputSelector": `//input[@data-testid="ocfEnterTextTextInput"]`,
//     "backupCodeNextBtn": `//span[text()='Next']`,

// }
// const XConfigSelectorStr = {
//     "notify": 'a[data-testid="AppTabBar_Notifications_Link"]',
//     "timelinePostIsPhoto": '[data-testid="tweetPhoto"]',
//     "timelinePostIsVideo": '[data-testid="videoPlayer"]',
//     "barback": 'div[data-testid="app-bar-back"]',
//     "closebtn": 'div[aria-label="Close"]'

// }
// class LikeXAct extends XAct {
//     constructor({ url }) {
//         super();
//         this.url = url;
//     }
//     async act(page, accountConfig) {
//         console.log("LikeXAct")
//         if (this.url && (page.url != this.url)) {
//             await page.goto(this.url);
//             await page.waitForTimeout(1000);
//         }
//         // const selectors = await page.$x(XConfig.likeSelector);
//         // if (selectors.length > 0) {
//         //     console.log('like');
//         //     await selectors[0].click();
//         // } else {
//         //     console.error('not found like button');
//         // }
//         this.like(page, page);
//     }
// }
// class ReplyXAct extends XAct {
//     constructor({ url, texts, random, options }) {
//         super();
//         this.url = url;
//         this.texts = texts;
//         this.random = random;
//         this.options = options;
//     }
//     async act(page, accountConfig) {
//         console.log("ReplyXAct")
//         if (this.url && (page.url != this.url)) {
//             await page.goto(this.url);
//             await page.waitForTimeout(1000);
//         }
//         this.reply(page, page, sample(this.texts));
//     }
// }
// class RepostXAct extends XAct {
//     constructor({ url }) {
//         super();
//         this.url = url;
//     }
//     async act(page, accountConfig) {
//         console.log("RepostXAct")
//         if (this.url && (page.url != this.url)) {
//             await page.goto(this.url);
//             await page.waitForTimeout(1000);
//         }
//         this.repost(page, page, sample(this.texts));
//     }
// }
// class ClickXAct extends XAct {

// }
// class WatchVideoXAct extends XAct {

// }

// class LoginXAct extends XAct {
//     constructor() {
//         super();
//     }
//     async act(page, accountConfig) {
//         console.log("LoginXAct")
//         await page.goto(XConfig.loginURL);
//         await page.waitForTimeout(5000);
//         // await page.waitForNavigation({timeout:10000});
//         // console.log('waiting for selector');
//         // await page.waitForSelector(XConfig.userNameXLoginSelector);
//         // console.log('start get selector');
//         const usernameSelector = await page.$x(XConfig.userNameXLoginSelector);
//         console.log('account: ')
//         console.log(accountConfig.xaccount);
//         if (usernameSelector.length > 0) {
//             console.log('enter user name');
//             await page.waitForTimeout(getRandomInt(3000, 3500));
//             await usernameSelector[0].click();
//             await page.keyboard.type(accountConfig.xaccount.username, { "delay": 300 });
//             await page.waitForTimeout(getRandomInt(1000, 1500));
//             console.log('select next button');
//             const nextBtnSelector = await page.$x(XConfig.userNameNexBtnXLoginSelector);
//             if (nextBtnSelector.length > 0) {
//                 await page.waitForTimeout(getRandomInt(3000, 3500));
//                 await nextBtnSelector[0].click();
//                 await page.waitForTimeout(getRandomInt(2000, 2500))
//                 const passwordInputSelcetor = await page.$x(XConfig.passwordXLoginSelector);
//                 if (passwordInputSelcetor.length > 0) {
//                     console.log('enter password');
//                     await page.waitForTimeout(getRandomInt(6000, 6500));
//                     await passwordInputSelcetor[0].click();
//                     await page.keyboard.type(accountConfig.xaccount.password, { "delay": 300 });
//                     const loginBtnSelector = await page.$x(XConfig.loginBtnXLoginSelector);
//                     if (loginBtnSelector.length > 0) {
//                         console.log("click login");
//                         await loginBtnSelector[0].click();
//                         await page.waitForTimeout(getRandomInt(2000, 2500));
//                         await this.nextStep(page, accountConfig);
//                     } else {
//                         console.log('login btn not found');
//                     }
//                 } else {
//                     console.log('Not found password input');
//                 }
//             } else {
//                 console.error('not found Next button');
//             }
//         } else {
//             console.error('not found username text');
//         }
//     }
//     async nextStep(page, accountConfig) {
//     }
// }
// class FollowXAct extends XAct {
//     constructor({ urls }) {
//         super();
//         this.urls = urls;
//     }
//     async act(page) {
//         console.log("FollowXAct")

//         for (let i = 0; i < this.urls.length; ++i) {
//             let url = this.urls[i];
//             if (url && (page.url != url)) {
//                 await page.goto(url);
//                 await page.waitForTimeout(1000);
//             }
//             const selectors = await page.$x(XConfig.followSelector);
//             if (selectors.length > 0) {
//                 console.log('follow');
//                 await selectors[0].click();
//             } else {
//                 console.error('not found follow button');
//             }
//             await page.waitForTimeout(2000);
//         }

//     }
// }

// class LoginX2FAAct extends LoginXAct {
//     async nextStep(page, accountConfig) {
//         let selector = await page.$x(XConfig.chooseDiffMethod);
//         if (selector.length > 0) {
//             await selector[0].click();
//             await page.waitForTimeout(getRandomInt(1000, 1500));
//             selector = await page.$x(XConfig.useBackupCode);
//             if (selector.length > 0) {
//                 await selector[0].click();
//                 await page.waitForTimeout(getRandomInt(1000, 1500));
//                 selector = await page.$x(XConfig.useBackupCodeNextBtn);
//                 if (selector.length > 0) {
//                     await selector[0].click();
//                     await page.waitForTimeout(getRandomInt(1000, 1500));
//                     selector = await page.$x(XConfig.backupCodeInputSelector);
//                     if (selector.length > 0) {
//                         await selector[0].click();
//                         await page.keyboard.type(accountConfig.xaccount.duphong2fa, { "delay": 300 });
//                         await page.waitForTimeout(getRandomInt(1000, 1500));
//                         selector = await page.$x(XConfig.backupCodeNextBtn);
//                         if (selector.length > 0) {
//                             selector[0].click();
//                         } else {
//                             console.log('Not found backupCodeNextBtn')
//                         }

//                     } else {
//                         console.log('Not found backupCodeInputSelector');
//                     }
//                 } else {
//                     console.log('Not found useBackupCodeNextBtn');
//                 }
//             } else {
//                 console.log('Not found useBackupCode check box');
//             }
//         } else {
//             console.log('Not foundchooseDiffMethod');
//         }
//     }
// }


// class SurfTimeLineXAct extends XAct {
//     constructor({ maxLikes, maxFollow, maxComment, maxRepost }) {
//         super();
//         this.maxLikes = maxLikes;
//         this.maxFollow = maxFollow;
//         this.maxComment = maxComment;
//         this.maxRepost = maxRepost;
//         this.currentLikes = 0;
//         this.currentFollows = 0;
//         this.currentComments = 0;
//         this.currentRepost = 0;
//     }


//     async act(page) {
//         await this.surf(page, this.maxLikes, this.maxFollow, this.maxComment, this.maxRepost,
//             this.currentLikes, this.currentFollows, this.currentComments, this.currentRepost)




//     }
//     async surfPost(page, selectorConfig) {
//         const items = await page.$x(selectorConfig);
//         if (items.length > 0) {
//             for (let i = 0; i < items.length - 2; ++i) {
//                 await items[i].hover();
//                 await page.waitForTimeout(1000);
//             }
//         } else {
//             console.log('no items found');
//         }
//     }
//     async clickBack(page) {
//         await page.click(XConfigSelectorStr.barback);
//         // const backBtn = await page.$x(XConfig.barback);
//         // if(backBtn.length > 0) {
//         //     console.log('click back btn')
//         //     backBtn[0].click();
//         // } else {
//         //     console.log('Not found back btn')
//         // }
//     }
//     async _isPhoto(selector) {
//         return await selector.$(XConfigSelectorStr.timelinePostIsPhoto) !== null;
//     }
//     async _isVideo(selector) {
//         return await selector.$(XConfigSelectorStr.timelinePostIsVideo) !== null;
//     }
//     _isInterest() {
//         // return sample([true, false]);
//         return Math.random() > 0.5;
//     }
//     _isMoreInterest() {
//         // return getRandomWeights([true, false], [1, 0]);
//         return Math.random() > 0.5;
//     }
// }
// function createAct(nameID, ...args) {
//     switch(nameID) {
//         case "OpenURL": return new OpenURL(args);
//     }
//     console.log("not found class");
// }

// class Loop extends Action {
//     constructor({ selector, type, acts, skipFirst }) {
//         super();
//         this.selector = selector;
        
//     }
   
// }

// class GetTexts extends GetText {
//     async process(item, page) {
//         let target = item, elements, select;
//         if(!target) {
//             target = page;
//         }
//         select = this.selector.replace(LoopID, "");
//         if (this.type === SelectorType.css) {
//             console.log(`select css: ${select}`);
//             elements = await target.$$(select);
//         }
//         if (this.type === SelectorType.x_path) {
//             elements = await target.$x(select);
//         }
//         console.log(`element got: ${elements}`);
//         return elements;
//     }
//     async act(page, accountConfig, browser, item) {
//         let curPage = await getActivePage(browser);
//         let elements = await this.process(item, curPage);
//         let txt = '';
//         for(let i = 0; i < elements.length; ++i) {
//             txt += ' ' + await curPage.evaluate(el => el.textContent, elements[i])
//         }
//         console.log(`remove character: ${this.removeCharacter}`);
//         for(let i = 0; i < this.removeCharacter.length; ++i) {
//             txt = txt.replaceAll(this.removeCharacter[i], '')
//         }
//         this.checkAndSave(txt);
//         // console.log('VariableManage: ')
//         // console.log(VariableManage.getVariable(this.asign.variable));
//         // console.log(`GetText: ${txt}`)
//     }
// }



// class GetRandomLink extends GetText {
//     async process(page) {
//         let target = page, elements, select;
//         select = this.selector.replace(LoopID, "");
//         if (this.type === SelectorType.css) {
//             console.log('select css');
//             elements = await target.$$(select);
//         }
//         if (this.type === SelectorType.x_path) {
//             elements = await target.$x(select);
//         }
//         return elements;
//     }
//     async act(page, accountConfig, browser, item) {
//         console.log('GetRandomLink/act');
//         let curPage = await getActivePage(browser);
//         let elements = await this.process(curPage);
//         let el = sample(elements);
//         let url = await curPage.evaluate(el => el.href, el)
//         this.checkAndSave(url);
//     }
// }
// class Trigger extends Action {
    
// }


// exports.Action = Action;
// exports.Scripting = Scripting;
// exports.GetLink = GetLink;
// exports.OpenURL = OpenURL;
// exports.ScreenShoot = ScreenShoot;
// exports.LoopData = LoopData;
// exports.VariableManage = VariableManage;
// exports.ClickAct = ClickAct;
// exports.GetRandomLink = GetRandomLink;

