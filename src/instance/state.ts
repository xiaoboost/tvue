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
    hyphenate,
    isString,
    isFunc,
    isStrictObject,
    isReservedAttribute,
} from 'src/utils';

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

function initProps(vm: Component, propsOptions: string[]) {
    if (!vm.$options.props) {
        return;
    }

    const props = vm._props;
    const keys = vm.$options.props;

    for (const key of keys) {
        const value = vm[key] as any;
        const hyphenatedKey = hyphenate(key);

        if (isReservedAttribute(hyphenatedKey)) {
            console.error(`"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`);
        }
        else {
            defineReactive(props, key, value);
        }
    }
}

function initData(vm: Component, stateOptions: string[]) {
    // ..
}

export function initState(vm: Component) {
    const opts = vm.$options;

    if (opts.props) {
        initProps(vm, opts.props);
    }

    if (opts.state) {
        initData(vm, opts.state);
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
