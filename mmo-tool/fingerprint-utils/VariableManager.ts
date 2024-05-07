export default class VariableManage {

    variable: Record<string, any>;
    setVariable(nameVariable: string, value: any) {
        this.variable[nameVariable] = value;
    }
    getVariable(nameVariable: string) {
        return this.variable[nameVariable];
    }
    private static _instance: VariableManage;

    private constructor() {
        this.variable = {};

    }

    public static get Instance() {
        // Do you need arguments? Make it a regular static method instead.
        return this._instance || (this._instance = new this());
    }
}