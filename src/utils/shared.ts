/**
 * 生成异步延迟函数
 * @param {number} [time=0]
 * @returns {Promise<void>}
 */
export function delay(time = 0) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * 生成随机字符串
 * @param {number} [len=16] 字符串长度
 * @returns {string}
 */
export function randomString(len = 16) {
    const start = 48, end = 126;
    const exclude = '\\/[]?{};,<>:|`';

    let codes = '';
    while (codes.length < len) {
        const code = String.fromCharCode(Math.random() * (end - start) + start);

        if (!exclude.includes(code)) {
            codes += code;
        }
    }

    return codes;
}

/**
 * 返回一个判断 key 是否存在其中的函数
 * @param {string} map 数据聚合
 * @param {boolean} [expectsLowerCase=false] 判断时是否变为小写
 */
export function makeMap(map: string, expectsLowerCase = false) {
    const inside = {};

    map.split(',').forEach((key) => (inside[key] = true));

    return expectsLowerCase
        ? (key: string) => Boolean(inside[key.toLowerCase()])
        : (key: string) => Boolean(inside[key]);
}

/**
 * Hyphenate a camelCase string.
 * @param {string} str
 */
export function hyphenate(str: string) {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase();
}

/**
 * 检查 key 是否存在于 obj 对象中
 * @param obj 检查对象
 * @param key 检查的属性名称
 */
export function hasOwn(obj: object, key: string): boolean {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * 对象是否为空
 * @param obj 待检测对象
 */
export function isEmpty(obj: object): boolean {
    return Object.keys(obj).length > 0;
}
