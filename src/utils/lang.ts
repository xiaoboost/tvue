/**
 * Check if a string starts with $ or _
 */
export function isReserved(str: string): boolean {
    const c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F;
}

/**
 * Define a property.
 */
export function def(obj: object, key: string | symbol, val: any, enumerable = false) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable,
        writable: true,
        configurable: true,
    });
}

/**
 * Parse simple path.
 */
const bailRE = /[^\w.$]/;
export function parsePath(path: string): undefined | ((obj: object) => any) {
    if (bailRE.test(path)) {
        return;
    }

    const segments = path.split('.');
    return function resolve(obj: object) {
        for (const key of segments) {
            if (!obj) {
                return;
            }
            obj = obj[key];
        }
        return obj;
    };
}
