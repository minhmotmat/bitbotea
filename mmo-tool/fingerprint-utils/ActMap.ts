import { ActionNames } from "./ActNames";
import { getRandomInt } from '../utils/utils';
import VariableManage from './VariableManager';
import { LoopID } from "./Constants";
import { formatQueryVariableText } from "./ScriptingUtil";
import ISelector, { SelectorType } from "./ISelector";
import { DiGraph, VertexDefinition, VertexId, VertexBody } from "digraph-js";
import { getActivePage } from "./GetActivePage";
export class Action implements VertexDefinition<VertexBody> {
    nameID: string = "Action";
    args: any;
    id: VertexId;
    adjacentTo: VertexId[] = [];
    body = {};
    constructor(id: string, args: any) {
        this.args = args;
        this.id = id;
        console.log("Action");
    }
    toJSON(graph: DiGraph<Action>, message: {curVistingID: string, curVisitingNameID:string }) {
        console.log(`${this.nameID}.toJSON`)
        graph;
        message.curVistingID = this.id;
        message.curVisitingNameID = this.nameID;
        return {
            nameID: this.nameID,
            args: this.args
        }
    }
    setArgs(args: any) {
        this.args = args;
    }
    async act(_: any, __: any, ___: any, ____: any, _____: any) {
        console.log("Please implement me");
    }
    async scrolDownToBottom(page: any) {
        let previousHeight = 1, scrollHeight = 2;
        while (previousHeight < scrollHeight) {
            previousHeight = await page.evaluate("document.body.scrollHeight");
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
            // await page.waitForFunction(
            //   `document.body.scrollHeight > ${previousHeight}`
            // );
            await page.waitForTimeout(3000);
            scrollHeight = await page.evaluate("document.body.scrollHeight")
        }
    }
    async scrolDownToBottomInfinite(page: any, max = 100) {
        console.log('scrolDownToBottomInfinite');
        let i = 0, previousHeight;
        while (i < max) {
            previousHeight = await page.evaluate("document.body.scrollHeight");
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
            await page.waitForFunction(
                `document.body.scrollHeight > ${previousHeight}`
            );
            await page.waitForTimeout(1000);
            ++i;
            console.log(`scroll ${i}`);

        }
    }
    async scrollDown(page: any, maxScrolls: number, delta: number, delay: number) {
        console.log('scrollDown');
        for (let i = 0; i < maxScrolls; ++i) {
            console.log(`scrollDown ${i}`)
            await page.mouse.wheel({ deltaY: delta });
            console.log(`delay ${i}`)
            await page.waitForTimeout(delay);
        }
    }
}
export class SelectorAct extends Action {
    selector: string;
    type: string;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.SelectorAct;
        this.selector = args.selector;
        this.type = args.type;
    }
    async getElement(target: any, item: any) {
        let element;
        let mainTarget = target;
        if (this.selector.includes(LoopID) && item) {
            mainTarget = item;
        }
        let selector = this.processSelector();
        switch (this.type) {
            case SelectorType.css:
                element = await mainTarget.$(selector); break;
            case SelectorType.x_path:
                element = await mainTarget.$x(selector); break;
            default:
                throw 'not found type selelctor';
        }
        return element;
    }
    processSelector() {
        if (this.selector.includes(LoopID)) {
            return this.selector.replace(LoopID, "")
        } else {
            return this.selector;
        }
    }
}
export class SelectorsAct extends SelectorAct {
    async getElements(target: any) {
        console.log(`SelectorsAct/getElements/selector${this.selector}`)
        let elements;
        switch (this.type) {
            case SelectorType.css:
                elements = await target.$$(this.selector); break;
            case SelectorType.x_path:
                elements = await target.$x(this.selector); break;
            default:
                throw 'not found type selelctor';
                return;
        }
        return elements;
    }
}
export class LoopBase extends Action {
    actions: any;
    stillLoop: boolean;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.LoopBase;
        this.actions = [];
        this.initAct(args.acts);
        this.stillLoop = true;
    }
    initAct(acts: any) {

        for (let a of acts) {
            console.log("act element config");
            console.log(a);
            this.actions.push(createAct(a.nameID, "-1", a.args))
        }

    }
    async loopOverActs(item: number, page: number, accountConfig: number, browser: number) {
        for (let i = 0; i < this.actions.length; ++i) {
            console.log(`${JSON.stringify(item)}`)
            if (this.stillLoop) {
                await this.actions[i].act(page, accountConfig, browser, item, this);
            } else {
                this.stillLoop = true;
                break;
            }
        }
    }
}

const LoopDataType = {
    Number: "Number"
}
export class LoopData extends LoopBase {
    type;
    params;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.LoopData;
        this.type = args.type;
        this.params = args.params;
    }
    async act(_: any, accountConfig: any, browser: any, __: any) {
        const curPage = await getActivePage(browser);
        console.log(`LoopData/act/type ${this.type}`)
        if (this.type == LoopDataType.Number) {
            console.log("LoopData/act")
            for (let i = this.params.start; i < this.params.end; ++i) {
                if (this.stillLoop) {
                    await this.loopOverActs(i, curPage, accountConfig, browser);
                } else {
                    this.stillLoop = true;
                    break;
                }
            }
        } else {
            console.log("not support this type");
        }
    }
}
export class Loop extends SelectorsAct {
    actions: any[];
    skipFirst: boolean;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.Loop;
        this.actions = [];
        this.skipFirst = args.skipFirst;
        this.initAct(args.acts);
    }
    toJSON(graph: DiGraph<Action>, message: {curVistingID: string, curVisitingNameID: string }): { nameID: string; args: any; } {
        let json = super.toJSON(graph, message)
        let children;
        message.curVistingID = this.id;
        message.curVisitingNameID = this.nameID;
        json.args["acts"] = [];
        do {
            children = graph.getChildren(message.curVistingID);
            console.log(`Loop/toJSON nameID ${message.curVisitingNameID}`)
            json.args.acts.push(children[0].toJSON(graph, message));
        } while (message.curVisitingNameID !== ActionNames.BreakLoop);
        if (message.curVisitingNameID !== ActionNames.BreakLoop) {
            throw "Missing Break Loop Action";
        }
        let nextVertecies = graph.getChildren(message.curVistingID);
        message.curVistingID = nextVertecies.length > 0 ? nextVertecies[0].id : "";
        return json;
    }
    initAct(acts: any) {
        if (!acts) acts = [];
        for (let a of acts) {
            console.log("act element config");
            console.log(a);
            this.actions.push(createAct(a.nameID, "-1", a.args))
        }

    }
    async act(_: any, accountConfig: any, browser: any) {
        let curPage = await getActivePage(browser, 2000);
        await this.scrollDown(curPage, 3, 400, 1000);
        let loopItems = await this.getElements(curPage);
        console.log('Loop/looop items');
        console.log(loopItems);
        let add = this.skipFirst ? 1 : 0;
        for (let i = 0 + add; i < loopItems.length; ++i) {
            await this.loopOverActs(loopItems[i], curPage, accountConfig, browser);
        }

    }
    async loopOverActs(item: any, page: any, accountConfig: any, browser: any) {
        for (let i = 0; i < this.actions.length; ++i) {
            console.log(`${JSON.stringify(item)}`)
            await this.actions[i].act(page, accountConfig, browser, item)
        }
    }

}


export class KeyboardPress extends Action {
    text: string;
    delay: number;
    queryVariable: string;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.KeyboardPress;
        this.text = args.text;
        this.delay = args.delay;
        this.queryVariable = args.queryVariable;
    }
    async act(_: any, __: any, browser: any) {
        let curPage = await getActivePage(browser);
        let text = this.text;
        if (this.queryVariable) {
            text = await formatQueryVariableText(curPage, text);
            console.log(`KeyboardPress/act/text: ${text}`)
        }
        await curPage.keyboard.type(text, { delay: this.delay });
    }
}

export class JavaScriptCode extends Action {
    code: string;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.JavaScriptCode;
        this.code = args.code;
    }
    async act(_: any, __: any, browser: any) {
        let curPage = await getActivePage(browser);
        let code = this.code;
        code = await formatQueryVariableText(curPage, this.code);
        let ret = await curPage.evaluate(code);
        console.log(`JavaScriptCode/return: ${ret}`)
        // document.body.querySelector(`cib-serp`).shadowRoot.querySelector(`cib-action-bar`).shadowRoot.querySelector(`cib-text-input`).shadowRoot.querySelector(`label`).click()
        //document.body.querySelector(`cib-serp`).shadowRoot.querySelector(`cib-action-bar`).shadowRoot.querySelector(`button`).click()
    }
}
export class HoverAct extends SelectorAct {
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.HoverAct;
    }
    async act(_: any, __: any, browser: any, item: any) {
        const curPage = await getActivePage(browser);
        let element = await this.getElement(curPage, item);
        if (element) {
            await element.hover();
        } else {
            console.log('error not found element');
            return;
        }
    }
}


export class GetText extends SelectorAct {
    asign;
    removeCharacter;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.GetText;
        this.asign = args.asign;
        if (args.removeCharacter) {
            this.removeCharacter = args.removeCharacter
        } else {
            this.removeCharacter = []
        }
    }
    async process(item: any, page: any) {
        let target = item, element;
        if (!target) {
            target = page;
        }
        element = this.getElement(target, null);
        console.log(`element got: ${element}`);
        return element;
    }
    processSelector(): string {
        return this.selector.replace(LoopID, "");
    }
    async act(_: any, __: any, browser: any, item: any) {
        let curPage = await getActivePage(browser);
        let element = await this.process(item, curPage);
        let txt = await curPage.evaluate((el: any) => el.textContent, element)
        console.log(`remove character: ${this.removeCharacter}`);
        for (let i = 0; i < this.removeCharacter.length; ++i) {
            txt = txt.replaceAll(this.removeCharacter[i], '')
        }
        this.checkAndSave(txt);
        // console.log('VariableManage: ')
        // console.log(VariableManage.getVariable(this.asign.variable));
        // console.log(`GetText: ${txt}`)
    }
    checkAndSave(value: any) {
        if (this.asign.variable) {
            // await page.evaluate(`localStorage.setItem(${this.asign.variable}, ${txt})`)
            VariableManage.Instance.setVariable(this.asign.variable, value);
        }
    }
}


export class GetLink extends GetText {
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.GetLink;
    }
    async act(_: any, __: any, browser: any, item: any) {
        let curPage = await getActivePage(browser);
        let element = await this.process(item, curPage)
        let url = await curPage.evaluate((el: any) => el.href, element)
        this.checkAndSave(url);
        console.log('VariableManage: ')
        console.log(VariableManage.Instance.getVariable(this.asign.variable));
        console.log(`GetText/${this.asign.variable} : ${url}`)
    }
}
export class Delay extends Action {
    time: number;
    addRandomTime: number;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.Delay;
        this.time = args.time;
        this.addRandomTime = args.addRandomTime === undefined ? 1000 : args.addRandomTime;
    }
    async act(_: any, __: any, browser: any) {
        console.log('Delay')
        const curPage = await getActivePage(browser);
        await curPage.waitForTimeout(getRandomInt(this.time, this.time + this.addRandomTime));
    }
}


export class CloseTabOrWindow extends Action {
    type;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.CloseTabOrWindow;
        this.type = args.type;
    }
    async act(_: any, __: any, browser: any, ___: any) {
        console.log('CloseTabOrWindow');
        if (this.type === "Tab") {
            await (await getActivePage(browser)).close();
        }
        if (this.type === "Window") {
            await browser.close();
        }
    }
}

export class BreakLoop extends Action {
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.BreakLoop;
    }
    async act(_: any, __: any, ___: any, ____: any, looper: any) {
        console.log('break loop');
        looper.stillLoop = false;
        console.log(`BreakLoop/looper/params: ${JSON.stringify(looper.params)}`)
    }
}
export class ClickAct extends SelectorAct {
    probability: any;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.ClickAct;
        // let options = {
        //     "offset": {
        //         "x": Math.floor(Math.random() * 6),
        //         "y": Math.floor(Math.random() * 9)
        //     }
        // }
        // this.options = options;
        this.probability = args.probability === undefined ? 1 : args.probability;
    }
    async act(_: any, __: any, browser: any, ___: any) {
        console.log('ClickAct')
        if (this.probability != undefined) {
            if (Math.random() >= this.probability) {
                console.log('not click')
                return;
            }
        }
        const curPage = await getActivePage(browser)
        await curPage.waitForSelector(this.selector, { timeout: 1000 });
        console.log('click');
        await curPage.click(this.selector);
    }
}
export class OpenURL extends Action {
    url: string;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.OpenURL;
        this.url = args.url;
    }
    async act(_: any, __: any, browser: any) {
        const newPage = await browser.newPage();
        let url = await formatQueryVariableText(newPage, this.url);
        //  = VariableManage.getVariable('url');
        console.log(`OpenURL/act/url: ${url}`);
        await newPage.goto(url);
        await newPage.waitForTimeout(1000);
    }
}
const ScreenShootType = {
    Element: "Element",
    Page: "Page"
}
export class ScreenShoot extends SelectorAct {
    path: string;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.ScreenShoot;
        this.path = args.path
        console.log(`path: ${args.path}`)
    }
    async act(_: any, __: any, browser: any, item: any) {
        const curPage = await getActivePage(browser);
        let target = curPage;
        switch (this.type) {
            case ScreenShootType.Page:
                console.log('screenshot/page')
                await curPage.screenshot({
                    path: this.path
                });
                return;
            case ScreenShootType.Element:
                console.log('screenshot/element')
                let selector = this.selector;
                if (selector.includes(LoopID)) {
                    selector = selector.replace(LoopID, "");
                    target = item;
                }
                const element = await target.$(selector);
                const bounding_box = await element.boundingBox();
                console.log(`bounding box: ${JSON.stringify(bounding_box)}`);
                await curPage.screenshot({
                    path: this.path,
                    clip: bounding_box
                });

                return;
        }

        // await curPage.screenshot({ path: "screenShot.png" })
    }
}
export class Trigger extends Action {
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.Trigger;
    }
}

const SwitchTabFindBy = {
    "Match": "Match",
    "Title": "Title",
    "Previous": "Previous",
    "Next": "Next"
}
export class SwitchTab extends Action {
    findBy: any;
    matchPattens: any;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.SwitchTab;
        this.findBy = args.findBy;
        this.matchPattens = args.matchPattens
    }
    async act(__: any, _: any, browser: any) {
        console.log(`SwitchTab/act`)
        let pages = await browser.pages();
        for (let i = 0; i < pages.length; ++i) {
            if (this.findBy === SwitchTabFindBy.Match) {
                let url = await pages[i].url();
                if (url.includes(this.matchPattens)) {
                    console.log("found");
                    await pages[i].bringToFront();
                    return;
                }
            } else {
                throw 'Not Implemented';
            }
        }
    }
}

export class ScrollAct extends Action {
    maxScrolls: number;
    delta: number;
    delay: number;
    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.ScrollAct;
        if (!args.maxScrolls) {
            this.maxScrolls = 50;
        } else {
            this.maxScrolls = args.maxScrolls;
        }
        this.delta = args.delta;
        this.delay = args.delay;
    }
    async act(_: any, __: any, browser: any) {
        const curPage = await getActivePage(browser);
        await this.scrollDown(curPage, this.maxScrolls, this.delta, this.delay)
    }
}

const ConditionParamType = {
    ElementTextCondPar: "ElementTextCondPar",
    ValueCondPar: "ValueCondPar",
    RandomCondPar: "RandomCondPar"
}
const createConditionParam = (type: string, args: any) => {
    switch (type) {
        case ConditionParamType.ElementTextCondPar:
            return new ElementTextCondPar(args);
        case ConditionParamType.ValueCondPar:
            return new ValueCondPar(args);
        case ConditionParamType.RandomCondPar:
            return new RandomCondPar(args);
        default:
            throw 'Not found ConditionParamType';
    }
}
class CondtionElement {
    first;
    operator;
    second;
    constructor(args: { first: any, operator: any, second: any }) {
        this.first = createConditionParam(args.first.nameID, args.first.args);
        this.operator = args.operator;
        this.second = createConditionParam(args.second.nameID, args.second.args);
    }
    async excuse(accountConfig: any, browser: any, item: any) {
        let curPage = await getActivePage(browser);
        switch (this.operator) {
            case "NotEqual":
                return await this.first.excuse(curPage, accountConfig, browser, item) != await this.second.excuse(curPage, accountConfig, browser, item);
            case "Equal":
                return await this.first.excuse(curPage, accountConfig, browser, item) == await this.second.excuse(curPage, accountConfig, browser, item);

            case "GreaterThan":
                return await this.first.excuse(curPage, accountConfig, browser, item) > await this.second.excuse(curPage, accountConfig, browser, item);
            case "LessThan":
                return await this.first.excuse(curPage, accountConfig, browser, item) < await this.second.excuse(curPage, accountConfig, browser, item);
            default:
                console.error("Not Found Operator");
        }
    }
}
abstract class CondtionElementParam implements ISelector {
    selector: string;
    type: string;
    constructor(args: any) {
        this.selector = args.selector;
        this.type = args.type;
    }
    abstract excuse(page: any, accountConfig: any, browser: any, item: any): any;
    async process(target: any) {
        let element, select;
        select = this.selector.replace(LoopID, "");
        if (this.type === SelectorType.css) {
            console.log('select css');
            element = await target.$(select);
        }
        if (this.type === SelectorType.x_path) {
            element = await target.$x(select)[0];
        }
        return element;
    }
}
class ElementTextCondPar extends CondtionElementParam {
    async excuse(page: any, _: any, browser: any, item: any) {
        const curPage = await getActivePage(browser);
        let element;
        if (this.selector.includes(LoopID)) {
            element = await this.process(item)
        } else {
            element = await this.process(curPage);
        }
        if (!element) {
            return null;
        }
        let txt = await page.evaluate((el: any) => el.textContent, element)
        return txt;
    }
}
class ValueCondPar extends CondtionElementParam {
    value;
    constructor(args: { value: string }) {
        super(args);
        this.value = args.value;
    }
    async excuse(_: any, __: any, ___: any, ____: any) {
        return this.value;
    }
}

class RandomCondPar extends CondtionElementParam {
    constructor(args: any) {
        super(args);
    }
    async excuse(_: any, __: any, ___: any, ____: any) {
        console.log('RandomCondPar/excuse')
        return Math.random();
    }
}
abstract class ConditionOp {
    params: any[];
    constructor() {
        this.params = [];
    }
    addParam(param: any) {
        this.params.push(param);
    }
    abstract excuse(accountConfig: any, browser: any, item: any): any;
}
class AndConditionOp extends ConditionOp {
    async excuse(accountConfig: any, browser: any, item: any) {
        let result = true;
        for (let i = 0; i < this.params.length; ++i) {
            result = result && await this.params[i].excuse(accountConfig, browser, item);
        }
        return result;
    }
}
class OrConditionOp extends ConditionOp {
    async excuse(accountConfig: any, browser: any, item: any) {
        let result = false;
        for (let i = 0; i < this.params.length; ++i) {
            result = result || await this.params[i].excuse(accountConfig, browser, item);
        }
        return result;
    }
}
export class Conditions extends Action {
    actions: any;
    fallbackactions: any;
    conditions;
    paths;

    constructor(id: string, args: any) {
        super(id, args);
        this.nameID = ActionNames.Conditions;
        this.actions = [];
        this.fallbackactions = [];
        this.conditions = [];
        this.paths = args.paths;
        console.log("Condition/paths")
        console.log(JSON.stringify(this.paths));
        for (let i = 0; i < this.paths.length; ++i) {
            this.actions.push([]);
            for (let j = 0; j < this.paths[i].acts.length; ++j) {
                let a = this.paths[i].acts[j];
                this.actions[i].push(createAct(a.nameID, "-1", a.args))
            }
            this.fallbackactions.push([]);
            for (let j = 0; j < this.paths[i].fallbackacts.length; ++j) {
                // throw 'Not Implemented'
                let a = this.paths[i].fallbackacts[j];
                this.fallbackactions[i].push(createAct(a.nameID, "-1", a.args));
            }
            let andConditionOp = new AndConditionOp();
            let andParams = this.paths[i].conditions.and
            for (let k = 0; k < andParams.length; ++k) {
                andConditionOp.addParam(new CondtionElement(andParams[k]))
            }
            let orConditionOp = new OrConditionOp();
            let orParams = this.paths[i].conditions.or
            for (let k = 0; k < orParams.length; ++k) {
                orConditionOp.addParam(new CondtionElement(orParams[k]))
            }
            this.conditions.push({
                "and": andConditionOp,
                "or": orConditionOp
            })
        }
    }
    async excuteAct(actions: any, page: any, accountConfig: any, browser: any, item: any, looper: any) {
        for (let i = 0; i < actions.length; ++i) {
            // console.log(`${JSON.stringify(item)}`)
            await actions[i].act(page, accountConfig, browser, item, looper)
        }
    }
    async condition(i: number, accountConfig: any, browser: any, item: any) {
        return this.conditions[i].and.excuse(accountConfig, browser, item) || this.conditions[i].or.excuse(accountConfig, browser, item);
    }
    async act(page: any, accountConfig: any, browser: any, item: any, looper: any) {
        console.log('Conditions/act')
        for (let i = 0; i < this.paths.length; ++i) {
            let cond = await this.condition(i, accountConfig, browser, item);
            console.log(`Conditions/${i}:${cond}`);
            if (cond) {
                console.log(`Conditions/${i}:excuse acts`);
                await this.excuteAct(this.actions[i], page, accountConfig, browser, item, looper)
            } else {
                console.log(`Conditions/${i}:fallback`);
                await this.excuteAct(this.fallbackactions[i], page, accountConfig, browser, item, looper);
            }
        }
    }
    traceChildren(graph: DiGraph<Action>, message: any, firstActChildrenID: string, jsonActs: any[]) {
        let nameID = this.nameID, children, vertexID = firstActChildrenID;
        do {
            children = graph.getChildren(vertexID);
            console.log(`Condtions/toJSON/traceChildren/vertexID ${vertexID}`)
            if (children.length <= 0) return;
            nameID = children[0].nameID;
            vertexID = children[0].id;
            console.log(`Condtions/toJSON/traceChildren/nameID ${nameID}`)
            message.curVistingID = children[0].id;
            jsonActs.push(children[0].toJSON(graph, message));
        } while (children.length > 0)
    }
    toJSON(graph: DiGraph<Action>, message: { curVistingID: string; curVisitingNameID:string}): { nameID: string; args: any; } {
        let json = super.toJSON(graph, message)
        for (let i = 0; i < this.paths.length; ++i) {
            

            json.args.paths[i]["acts"] = [];
            json.args.paths[i]["fallbackacts"] = [];
            const [actChildren, fallBackActChildren] = graph.getChildren(this.id);
            if (actChildren) {
                json.args.paths[i].acts.push(actChildren.toJSON(graph, message));
                this.traceChildren(graph, message, actChildren.id, json.args.paths[i].acts);
            }
            if (fallBackActChildren) {
                json.args.paths[i].fallbackacts.push(fallBackActChildren.toJSON(graph, message));
                this.traceChildren(graph, message, fallBackActChildren.id, json.args.paths[i].fallbackacts);
            }
        }
        // message.curVistingID = "";
        return json;
    }
}
export default function createAct(nameID: string, id: string, args: any) {

    switch (nameID) {
        case ActionNames.BreakLoop: return new BreakLoop(id, args);
            break;
        case ActionNames.ClickAct: return new ClickAct(id, args);
            break;
        case ActionNames.CloseTabOrWindow: return new CloseTabOrWindow(id, args);
            break;
        case ActionNames.Conditions: return new Conditions(id, args);
            break;
        case ActionNames.Delay: return new Delay(id, args);
            break;
        case ActionNames.GetLink: return new GetLink(id, args);
            break;
        case ActionNames.GetText: return new GetText(id, args);
            break;
        case ActionNames.HoverAct: return new HoverAct(id, args);
            break;
        case ActionNames.JavaScriptCode: return new JavaScriptCode(id, args);
        //         break;
        case ActionNames.KeyboardPress: return new KeyboardPress(id, args);
            break;
        case ActionNames.Loop: return new Loop(id, args);
            break;
        case ActionNames.LoopData: return new LoopData(id, args);
            break;
        case ActionNames.OpenURL: return new OpenURL(id, args);
            break;
        case ActionNames.ScreenShoot: return new ScreenShoot(id, args);
            break;
        case ActionNames.ScrollAct: return new ScrollAct(id, args);
            break;
        case ActionNames.SwitchTab: return new SwitchTab(id, args);
            break;
        case ActionNames.Trigger: return new Trigger(id, args);
        default:
            console.log(`error not found ${nameID}`)
            throw `error not found ${nameID}`
    }
}