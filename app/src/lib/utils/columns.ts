/**
 * 返回一个函数，该函数返回一个数组，该数组包含模型中的所有列
 * @param Model - 模型类型
 * @returns 一个函数，该函数返回一个数组，该数组包含模型中的所有列
 */
export function columns<Model>() {
    return <const Names extends readonly (keyof Model)[]>(...names: Names) => names;
}