import Vues, { ComponentOptions } from '../instance';

export type VuesClass<V> = { new (...args: any[]): V & Vues } & typeof Vues;

export function componentFactory(
    Component: VuesClass<Vues>,
    options: ComponentOptions = {},
): VuesClass<Vues> {
    // name of component
    options.name = options.name || (Component as any).name;

    // prototype props.
    const proto = Component.prototype;
    Object.getOwnPropertyNames(proto).forEach((key) => {
        if (key === 'constructor') {
            return;
        }

        const descriptor = Object.getOwnPropertyDescriptor(proto, key)!;

        // FIXME: 只收集带修饰器的参数
        // methods
        if (typeof descriptor.value === 'function') {
            (options.methods || (options.methods = {}))[key] = descriptor.value;
        }
        // computed properties
        else if (descriptor.get || descriptor.set) {
            (options.computed || (options.computed = {}))[key] = {
                get: descriptor.get,
                set: descriptor.set,
            };
        }
    });

    // TODO: 返回新的类
    return class extends Component {
        constructor() {
            super();

            // TODO: 添加操作，器件初始化
        }
    };
}
