// 浏览器环境判断
export const inBrowser = typeof window !== 'undefined';
export const UA = inBrowser && window.navigator.userAgent.toLowerCase();
export const isIE = UA && /msie|trident/.test(UA);
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0;
export const isEdge = UA && UA.indexOf('edge/') > 0;
export const isAndroid = UA && UA.indexOf('android') > 0;
export const isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// Firefox has a "watch" function on Object.prototype...
export const nativeWatch = ({} as any).watch;

export let supportsPassive = false;
export let supportsOnce = false;

if (inBrowser) {
    try {
        const opts = Object.defineProperty({}, 'passive', {
            get() {
                supportsPassive = true;
            },
        });
        document.body.addEventListener('test', null as any, opts);
    }
    catch (e) {}

    try {
        const opts = Object.defineProperty({}, 'once', {
            get() {
                supportsOnce = true;
            },
        });
        document.body.addEventListener('test', null as any, opts);
    }
    catch (e) {}
}

export function isNative(Ctor: any): boolean {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}

export const hasSymbol =
    typeof Symbol !== 'undefined' && isNative(Symbol) &&
    typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);
