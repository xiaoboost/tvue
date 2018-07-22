import Component from './index';
import VNode, { VNodeData, VNodeChildren, createEmptyVNode } from '../vdom';

import { patch } from '../vdom/patch';
import { createElement } from '../vdom/create-element';
import { isArray, warn, handleError } from '../utils';

export function initRender(vm: Component) {
    vm.$createElement = (
        tag?: string,
        data?: VNodeData | VNodeChildren,
        children?: VNodeChildren,
    ) => {
        return createElement(vm, tag, data, children);
    };
}

export function renderMixin(Vue: typeof Component) {
    Vue.prototype._patch = patch;

    Vue.prototype._render = function(this: Component) {
        let vnode: VNode, render = this.render;

        if (process.env.NODE_ENV !== 'production' && !this.render) {
            warn('Render method is requied', this);
            render = () => this.$createElement('div', ['Render method is requied']);
        }

        try {
            vnode = render.call(this, this.$createElement);
        }
        catch (e) {
            handleError(e, this, `render`);
            vnode = this.$vnode;
        }

        // return empty vnode in case the render function errored out
        if (!(vnode instanceof VNode)) {
            if (process.env.NODE_ENV !== 'production' && isArray(vnode)) {
                warn(
                    'Multiple root nodes returned from render function. Render function ' +
                    'should return a single root node.',
                    this,
                );
            }
            vnode = createEmptyVNode();
        }

        // TODO: set parents
        return vnode;
    };
}
