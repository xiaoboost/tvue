import Vuets, { ComponentOptions } from '../instance';
import { initState } from '../instance/state';
import { initRender } from '../instance/render';
import { LifecycleKeys } from '../instance/lifecycle';

export type VuetsClass<V> = { new (...args: any[]): V & Vuets } & typeof Vuets;

// lifecycle method names
const lifecycles: LifecycleKeys[] =
    ['beforeMount', 'mounted', 'beforeDestroy', 'destroyed', 'beforeUpdate'];

function mergeOptions(to: ComponentOptions, from: ComponentOptions) {
    if (from.props) {
        to.props = (to.props || []).concat(from.props);
        to.props = Array.from(new Set(to.props));
    }

    if (from.state) {
        to.state = (to.state || []).concat(from.state);
        to.state = Array.from(new Set(to.state));
    }
}

function componentFactory(
    Comp: VuetsClass<Vuets>,
    options: ComponentOptions = {},
): VuetsClass<Vuets> {
    // name of Component
    options.name = options.name || (Comp as any).name;
    // prototype chains
    const chain: Array<VuetsClass<Vuets>> = [];

    for (
        let proto = Comp.prototype;
        !proto || proto !== Vuets.prototype;
        proto = Object.getPrototypeOf(proto)
    ) {
        chain.push(proto);
    }

    chain.reverse();

    for (const proto of chain) {
        Object.getOwnPropertyNames(proto).forEach((key) => {
            if (key === 'constructor') {
                return;
            }

            // const descriptor = Object.getOwnPropertyDescriptor(proto, key)!;

            // options
            if (key === '$options') {
                mergeOptions(options, proto[key]);
            }
            // lifecycle
            else if (lifecycles.includes(key as LifecycleKeys)) {
                options[key] = proto[key];
                delete proto[key];
            }
            // methods
            // else if (typeof descriptor.value === 'function') {
            //     Object.defineProperty(newProto, key, descriptor);
            // }
            // computed properties
            // else if (descriptor.get || descriptor.set) {
            //     (options.computed || (options.computed = {}))[key] = {
            //         get: descriptor.get,
            //         set: descriptor.set,
            //     };
            // }
        });
    }

    const oldProto = chain[chain.length - 1];

    // new Component class
    class VueComponent extends Comp {
        constructor() {
            super();

            Object.setPrototypeOf(this, oldProto);

            initState(this);
            initRender(this);
        }
    }

    Object.defineProperty(oldProto, '$options', {
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
