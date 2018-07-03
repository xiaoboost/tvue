import Vuets, { ComponentOptions } from '../instance';
import { initState } from '../instance/state';

export type VuetsClass<V> = { new (...args: any[]): V & Vuets } & typeof Vuets;

function componentFactory(
    Comp: VuetsClass<Vuets>,
    options: ComponentOptions = {},
): VuetsClass<Vuets> {
    // name of component
    options.name = options.name || (Comp as any).name;

    // prototype props.
    // const proto = Component.prototype;
    // Object.getOwnPropertyNames(proto).forEach((key) => {
    //     if (key === 'constructor') {
    //         return;
    //     }

    //     const descriptor = Object.getOwnPropertyDescriptor(proto, key)!;

    //     // FIXME: 只收集带修饰器的参数
    //     // methods
    //     if (typeof descriptor.value === 'function') {
    //         (options.methods || (options.methods = {}))[key] = descriptor.value;
    //     }
    //     // computed properties
    //     else if (descriptor.get || descriptor.set) {
    //         (options.computed || (options.computed = {}))[key] = {
    //             get: descriptor.get,
    //             set: descriptor.set,
    //         };
    //     }
    // });

    return class extends Comp {
        constructor() {
            super();

            initState(this);
        }
    };
}

export function Component<V extends Vuets>(options: ComponentOptions): <VC extends VuetsClass<V>>(target: VC) => VC;
export function Component<VC extends VuetsClass<Vuets>>(target: VC): VC;
export function Component(options: ComponentOptions | VuetsClass<Vuets>): any {
    if (typeof options === 'function') {
        return componentFactory(options);
    }
    else {
        return (Comp: VuetsClass<Vuets>) => componentFactory(Comp, options);
    }
}
