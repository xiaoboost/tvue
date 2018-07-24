import Component from '../instance';

export function warn(msg: string, vm?: Component) {
    const tip = vm ? ` - Component: ${vm.$options.name}` : '';
    console.error(`[Vue warn${tip}]: ${msg}`);
}

export function handleError(err: Error, vm?: Component, info?: string) {
    // ..
}
