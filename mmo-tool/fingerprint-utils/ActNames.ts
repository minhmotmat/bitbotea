export const ActionNames = {
    BreakLoop: "BreakLoop",
    ClickAct: "ClickAct",
    CloseTabOrWindow: "CloseTabOrWindow",
    Conditions: "Conditions",
    Delay: "Delay",
    GetLink: "GetLink",
    GetText: "GetText",
    HoverAct: "HoverAct",
    JavaScriptCode: "JavaScriptCode",
    KeyboardPress: "KeyboardPress",
    LoopData: "LoopData",
    Loop: "Loop",
    OpenURL: "OpenURL",
    ScreenShoot: "ScreenShoot",
    ScrollAct: "ScrollAct",
    SwitchTab: "SwitchTab",
    Trigger: "Trigger",
    SelectorAct: "SelectorAct",
    SelectorsAct: "SelectorsAct",
    LoopBase: "LoopBase",

}
export const getAllActions = function () {
    return Object.getOwnPropertyNames(ActionNames)
}