import Component from './index';
import VNode from '../vdom/vnode';
import { isFunc } from '../utils';

export function lifecycleMixin(Vue: typeof Component) {
    Vue.prototype._update = function(this: Component, vnode: VNode, hydrating?: boolean) {
        const vm: Component = this
        const prevEl = vm.$el
        const prevVnode = vm._vnode
        const prevActiveInstance = activeInstance
        activeInstance = vm
        vm._vnode = vnode
        // Vue.prototype.__patch__ is injected in entry points
        // based on the rendering backend used.
        if (!prevVnode) {
          // initial render
          vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
        } else {
          // updates
          vm.$el = vm.__patch__(prevVnode, vnode)
        }
        activeInstance = prevActiveInstance
        // update __vue__ reference
        if (prevEl) {
          prevEl.__vue__ = null
        }
        if (vm.$el) {
          vm.$el.__vue__ = vm
        }
        // if parent is an HOC, update its $el as well
        if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
          vm.$parent.$el = vm.$el
        }
        // updated hook is called by the scheduler to ensure that children are
        // updated in a parent's updated hook.
    };

    Vue.prototype.$mount = function(this: Component, el: string | Element) {
        isFunc(this.beforeMount) && this.beforeMount();

        // 组件更新回调
        const updateComponent = () => {
            this._update(this._render());
        };

        isFunc(this.mounted) && this.mounted();
        return this;
    };

    Vue.prototype.$forceUpdate = function(this: Component) {
        if (this._watcher) {
            this._watcher.update();
        }
    };

    Vue.prototype.$destroy = function(this: Component) {
    const vm: Component = this
    if (vm._isBeingDestroyed) {
        return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm)
    }
    // teardown watchers
    if (vm._watcher) {
        vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
        vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    vm.__patch__(vm._vnode, null)
    // fire destroyed hook
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
        vm.$el.__vue__ = null
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
        vm.$vnode.parent = null
    }
    };
}
