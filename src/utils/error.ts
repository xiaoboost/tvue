import Component from '../instance';

export function warn(msg: string, vm: Component) {
    console.error(`[ ${vm.$options.name} warn]: ${msg}`);
}

export function handleError(err: Error, vm: Component, info: string) {
    // ..
}
