import VariableManage from "./VariableManager";
export const ReplaceGetVariablePre = "$mmoGetVariable(";
export const ReplaceVariableEnd = ")$";
export const ReplaceSetVariablePre = "$mmoSetVariable(";

export function getAllRefGetVariableName(s: string) {
    const RegGetVariable = new RegExp(/\$mmoGetVariable\((.*?)\)\$/g);
    return [...s.matchAll(RegGetVariable)].map((v) => v[1]);
}
export function getAllRefSetVariableName(s: string) {
    const RegSetVariable = /\$mmoSetVariable\((.*?)\)\$/g
    return [...s.matchAll(RegSetVariable)].map((v) => v[1].replace(' ', '').split(','));
}
export async function formatQueryVariableText(page: any, s: string) {
    // check variable
    const RegSetVariable = /\$mmoSetVariable\((.*?)\)\$/g
    const RegGetVariable = new RegExp(/\$mmoGetVariable\((.*?)\)\$/g);
    if (RegGetVariable.test(s)) {
        const getVars = getAllRefGetVariableName(s);
        console.log('getVars');
        console.log(getVars);
        for (const v of getVars) {
            let value = VariableManage.Instance.getVariable(v);
            let changeText = ReplaceGetVariablePre + v + ReplaceVariableEnd;
            console.log(`changetext: ${changeText}`)
            s = s.replace(changeText, `${value}`);
        }
        console.log('new text after get: ')
        console.log(s);
    }
    if (RegSetVariable.test(s)) {
        const setVars = getAllRefSetVariableName(s);
        for (let i = 0; i < setVars.length; ++i) {
            let evalue: any = setVars[i][1];
            if (/^\d/.test(evalue)) {
                evalue = Number(evalue);
            }
            console.log(`evalue: ${evalue}`);
            let ret = await page.evaluate(evalue);
            VariableManage.Instance.setVariable(setVars[i][0], ret);
            let changeText = ReplaceSetVariablePre + setVars[i][0] + ',' + setVars[i][1] + ReplaceVariableEnd;
            s = s.replace(changeText, "");
            console.log(`${setVars[i][0]}: ${VariableManage.Instance.getVariable(setVars[i][0])}`)
        }
        console.log('new text after set: ')
        console.log(s);
    }
    return s;
}