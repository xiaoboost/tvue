import Vuets from '../instance';

function setOptions(prototype: { $options: any }, key: string, val: any) {
    if (!prototype.$options) {
        prototype.$options = {};
    }

    if (!prototype.$options[key]) {
        prototype.$options[key] = val;
    }

    return val;
}

export function Prop(target: Vuets | typeof Vuets, propertyKey: string) {
    const props = setOptions(Vuets.prototype, 'props', []);

    if (!props.includes(propertyKey)) {
        props.push(propertyKey);
    }
}

export function State(target: Vuets | typeof Vuets, propertyKey: string) {
    const props = setOptions(Vuets.prototype, 'data', []);

    if (!props.includes(propertyKey)) {
        props.push(propertyKey);
    }
}
