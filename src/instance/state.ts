import Component from './index';

import {
    set,
    del,
    Watcher,
    WatcherCb,
    observe,
    WatcherOption,
    defineReactive,
} from '../observer';

import {
    warn,
    hyphenate,
    isString,
    isFunc,
    isStrictObject,
    isReserved,
    isReservedAttribute,
} from '../utils';

function createWatcher(
    vm: Component,
    expOrFn: string,
    handler: string | WatcherOption,
    options?: WatcherOption,
) {
    let cb: WatcherOption['handler'];

    if (isStrictObject(handler)) {
        options = handler;
        cb = handler.handler;
    }
    else if (isString(handler)) {
        cb = vm[handler];
    }

    if (!cb) {
        throw new Error('watcher must has a callback.');
    }

    return vm.$watch(expOrFn, cb, options);
}

function initProps(vm: Component) {
    if (!vm.$options.props) {
        return;
    }

    function propProxy(key: string) {
        const option: PropertyDescriptor = {
            enumerable: true,
            configurable: true,
            get: () => vm._props[key],
        };

        if (process.env.NODE_ENV !== 'production') {
            option.set = () => warn('prop is readonly', vm);
        }

        Object.defineProperty(vm, key, option);
    }

    const props = vm._props;
    const keys = vm.$options.props;

    for (const key of keys) {
        const value = (vm[key] || null) as any;
        const hyphenatedKey = hyphenate(key);

        if (isReservedAttribute(hyphenatedKey)) {
            console.error(
                `"${hyphenatedKey}" is a reserved attribute` +
                'and cannot be used as component prop. So skip this prop.',
            );
            continue;
        }

        defineReactive(props, key, value);
        propProxy(key);
    }
}

function initStateData(vm: Component) {
    const state = vm._state;
    const keys = vm.$options.state || [];

    function stateProxy(key: string) {
        const option: PropertyDescriptor = {
            enumerable: true,
            configurable: true,
            get: () => vm._state[key],
            set: (val: any) => vm._state[key] = val,
        };

        Object.defineProperty(vm, key, option);
    }

    for (const key of keys) {
        const value = (vm[key] || null) as any;

        if (!isReserved(key)) {
            state[key] = value;
            stateProxy(key);
        }
    }

    // observe data
    observe(state, true /* asRootData */);
}

export function initState(vm: Component) {
    const opts = vm.$options;

    if (opts.props) {
        initProps(vm);
    }

    if (opts.state) {
        initStateData(vm);
    }
}

export function stateMixin(Vue: typeof Component) {
    Vue.prototype.$set = set;
    Vue.prototype.$delete = del;

    Vue.prototype.$watch = function(
        this: Component,
        express: string,
        callback: string | WatcherOption | WatcherCb,
        options: WatcherOption = {},
    ) {
        if (isFunc(callback)) {
            const watcher = new Watcher(this, express, callback, {
                user: true,
                deep: !!options.deep,
            });

            if (options.immediate) {
                callback.call(this, watcher.value);
            }

            return function unwatchFn() {
                watcher.teardown();
            };
        }
        else {
            return createWatcher(this, express, callback, options);
        }
    };
}
