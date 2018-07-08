import Vuets from '../instance';

function setOptions(target: Vuets | typeof Vuets, key: string, val: any) {
    const Ctor = typeof target === 'function' ? target : target.constructor;
    const prototype = Ctor.prototype;

    if (!prototype.$options) {
        Object.defineProperty(prototype, '$options', {
            enumerable: false,
            configurable: true,
            writable: false,
            value: {},
        });
    }

    if (!prototype.$options[key]) {
        prototype.$options[key] = val;
    }

    return val;
}

export function Prop(target: Vuets | typeof Vuets, propertyKey: string) {
    const props = setOptions(target, 'props', []);

    if (!props.includes(propertyKey)) {
        props.push(propertyKey);
    }
}

export function State(target: Vuets | typeof Vuets, propertyKey: string) {
    const states = setOptions(target, 'state', []);

    if (!states.includes(propertyKey)) {
        states.push(propertyKey);
    }
}