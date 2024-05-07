export default interface ISelector {
    selector: string;
    type: string;
}
export const SelectorType = {
    css: "css",
    x_path: "x-path"
};