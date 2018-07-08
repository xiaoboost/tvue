import Vuets, { ComponentOptions } from '../instance';
import { initState } from '../instance/state';

export type VuetsClass<V> = { new (...args: any[]): V & Vuets } & typeof Vuets;

function mergeOptions(to: ComponentOptions, from: ComponentOptions) {
    if (from.props) {
        to.props = (to.props || []).concat(from.props);
    }

    if (from.state) {
        to.state = (to.state || []).concat(from.state);
    }
}

function componentFactory(
    Comp: VuetsClass<Vuets>,
    options: ComponentOptions = {},
): VuetsClass<Vuets> {
    // new Component class
    class VueComponent extends Vuets {
        constructor() {
            super();

            initState(this);
        }
    }

    // name of Component
    options.name = options.name || (Comp as any).name;
    // prototype chains
    const chain: Array<VuetsClass<Vuets>> = [];
    const newProto = VueComponent.prototype;

    let origin = Comp.prototype;
    while (!origin || origin !== Vuets.prototype) {
        chain.push(origin);
        origin = Object.getPrototypeOf(origin);
    }

    chain.reverse();

    for (const oldProto of chain) {
        Object.getOwnPropertyNames(oldProto).forEach((key) => {
            if (key === 'constructor') {
                return;
            }

            const descriptor = Object.getOwnPropertyDescriptor(oldProto, key)!;

            // options
            if (key === '$options') {
                mergeOptions(options, oldProto[key]);
            }
            // methods
            else if (typeof descriptor.value === 'function') {
                Object.defineProperty(newProto, key, descriptor);
            }
            // computed properties
            // else if (descriptor.get || descriptor.set) {
            //     (options.computed || (options.computed = {}))[key] = {
            //         get: descriptor.get,
            //         set: descriptor.set,
            //     };
            // }
        });
    }

    Object.defineProperty(newProto, '$options', {
        configurable: true,
        enumerable: false,
        writable: false,
        value: options,
    });

    return VueComponent;
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
