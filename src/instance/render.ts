import Component from './index';
import { createElement } from '../vdom/create-element';
import { VNodeData, VNodeChildData } from '../vdom/vnode';

export function renderMixin(Vue: typeof Component) {
    Vue.prototype.$createElement = function(this: Component, tag: string, data: VNodeData | VNodeChildData, children?: VNodeChildData) {
        return createElement(this, tag, data, children);
    };

    Vue.prototype._render = function() {
        // render self
        let vnode;

        try {
            vnode = this.render(this.$createElement);
        }
        catch (e) {
            throw new Error(`(render) ${e.message}`);
        }

        // set parent
        vnode.parent = this.$vnode.parent;
        return vnode;
    };
}
