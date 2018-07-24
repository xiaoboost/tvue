import VNode from '../vdom';
import Component from './index';
import { Watcher } from '../observer';
import { isString, remove, warn, handleError } from '../utils';

export type LifecycleKeys =
    'beforeMount' | 'mounted' |
    'beforeDestroy' | 'destroyed' | 'beforeUpdate';

export function lifecycleMixin(Vue: typeof Component) {
    Vue.prototype._update = function(this: Component, vnode: VNode) {
        const prevVnode = this.$vnode;

        this.$vnode = vnode;

        if (!prevVnode) {
            // initial render
            this.$el = this._patch(this.$el, vnode, false /* removeOnly */);
        }
        else {
            // updates
            this.$el = this._patch(prevVnode, vnode);
        }

        // if parent is an HOC, update its $el as well
        if (this.$vnode && this.$parent && this.$vnode === this.$parent.$vnode) {
            this.$parent.$el = this.$el;
        }
    };

    Vue.prototype._callHook = function(this: Component, name: LifecycleKeys) {
        const handlers = this.$options[name] || [];

        for (const handler of handlers) {
            try {
                handler.call(this);
            }
            catch (e) {
                handleError(e, this, `${name} hook`);
            }
        }
    };

    Vue.prototype.$forceUpdate = function(this: Component) {
        if (this._watcher) {
            this._watcher.update();
        }
    };

    Vue.prototype.$mount = function(this: Component, entry?: string | Element) {
        let el: Element;

        if (!entry) {
            el = document.createElement('div');
        }
        else if (isString(entry)) {
            el = document.querySelector(entry)!;

            if (process.env.NODE_ENV !== 'production' && !el) {
                warn(`Cannot find element: ${entry}`);
                el = document.createElement('div');
            }
        }
        else {
            el = entry;
        }

        if (
            process.env.NODE_ENV !== 'production' &&
            (el === document.body || el === document.documentElement)
        ) {
            warn('Do not mount Vue to <html> or <body> - mount to normal elements instead.');
            return this;
        }

        this.$el = el;

        this._callHook('beforeMount');

        const updateComponent = () => {
            this._update(this._render());
        };

        const before = function(this: Component) {
            this._isMounted && this._callHook('beforeUpdate');
        };

        // we set this to this._watcher inside the watcher's constructor
        // since the watcher's initial patch may call $forceUpdate (e.g. inside child
        // component's mounted hook), which relies on this._watcher being already defined
        new Watcher(this, updateComponent, () => {}, { before }, true);

        // manually mounted instance, call mounted on self
        // mounted is called for render-created child components in its inserted hook
        if (document.body.contains(this.$el)) {
            this._isMounted = true;
            this._callHook('mounted');
        }

        return this;
    };

    Vue.prototype.$destroy = function(this: Component) {
        if (this._isBeingDestroyed) {
            return;
        }

        this._callHook('beforeDestroy');

        this._isBeingDestroyed = true;
        // remove self from parent
        const parent = this.$parent;
        if (parent && !parent._isBeingDestroyed) {
            remove(parent.$children, this);
        }

        // teardown watchers
        if (this._watcher) {
            this._watcher.teardown();
        }

        for (const watcher of this._watchers) {
            watcher.teardown();
        }

        // remove reference from data ob
        // frozen object may not have observer.
        if (this._state.__ob__) {
            this._state.__ob__.thisCount--;
        }

        // call the last hook...
        this._isDestroyed = true;
        // invoke destroy hooks on current rendered tree
        this._patch(this.$vnode);

        // fire destroyed hook
        this._callHook('destroyed');
        // turn off all instance listeners.
        this.$off();

        // release circular reference (#6759)
        if (this.$vnode) {
            this.$vnode.parent = undefined;
        }
    };
}
