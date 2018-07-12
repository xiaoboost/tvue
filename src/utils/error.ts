import Component from '../instance';

export function warn(msg: string, vm: Component) {
    console.error(`[ ${vm.$options.name} warn]: ${msg}`);
}
