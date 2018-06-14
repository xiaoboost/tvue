import Component from './index';
import VNode from '../vdom/vnode';
import { remove } from '../utils';

function callHook(vm: Component, hook: string) {
    const handlers = vm.$options[hook];

    if (handlers) {
        handlers.forEach((fn) => fn.apply(vm));
    }

    vm.$emit('hook:' + hook);
}

export function lifecycleMixin(Vue: typeof Component) {
    Vue.prototype._update = function(this: Component, vnode: VNode, hydrating?: boolean) {
        const prevEl = this.$el;
        const prevVnode = this._vnode;

        this._vnode = vnode;

        // Vue.prototype.__patch__ is injected in entry points
        // based on the rendering backend used.
        if (!prevVnode) {
            // initial render
            this.$el = this.__patch__(undefined, vnode, false /* removeOnly */);
        }
        else {
            // updates
            this.$el = this.__patch__(prevVnode, vnode);
        }

        // if parent is an HOC, update its $el as well
        if (this.$vnode && this.$parent && this.$vnode === this.$parent._vnode) {
            this.$parent.$el = this.$el;
        }
    };

    Vue.prototype.$mount = function(this: Component, el: string | Element) {
        callhook(this, 'beforeMount');

        // 组件更新回调
        const updateComponent = () => {
            this._update(this._render());
        };

        callhook(this, 'mounted');
        return this;
    };

    Vue.prototype.$forceUpdate = function(this: Component) {
        if (this._watcher) {
            this._watcher.update();
        }
    };

    Vue.prototype.$destroy = function(this: Component) {
        if (this._isBeingDestroyed) {
            return;
        }

        callHook(this, 'beforeDestroy');
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
        let i = this._watchers.length;
        while (i--) {
            this._watchers[i].teardown();
        }

        // remove reference from data ob
        // frozen object may not have observer.
        if (this._data.__ob__) {
            this._data.__ob__.thisCount--;
        }

        // call the last hook...
        this._isDestroyed = true;
        // invoke destroy hooks on current rendered tree
        this.__patch__(this._vnode, undefined);
        // fire destroyed hook
        callHook(this, 'destroyed');
        // turn off all instance listeners.
        this.$off();
        // release circular reference (#6759)
        if (this.$vnode) {
            this.$vnode.parent = undefined;
        }
    };
}
