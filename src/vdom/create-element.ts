import Component from '../instance';

import VNode, {
    VNodeData,
    createTextVNode,
    createEmptyVNode,
} from './vnode';

import {
    warn,
    camelize,
    isArray,
    isBaseType,
    getTagNamespace,
    isReservedTag,
} from '../utils';
import { createComponent } from './create-component';

export function createElement(
  context: Component,
  tag: string | typeof Component,
  data: VNodeData | Array<VNode | string> = {},
  children: Array<VNode | string> = [],
): VNode {
    if (isArray(data)) {
        children = data;
        data = {};
    }

    if (data && (data as any).__ob__) {
        process.env.NODE_ENV !== 'production' && warn(
            `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
            'Always create fresh vnode data objects in each render!',
            context,
        );
        return createEmptyVNode();
    }

    // 子组件中如果有纯文本，则创建文本元素
    const ChildVNode = children.map((node) =>
        isBaseType(node) ? createTextVNode(node) : node,
    );

    // object syntax in v-bind
    if (data.is) {
        tag = data.is;
    }
    // falsy tag
    if (!tag) {
        return createEmptyVNode();
    }

    // warn against non-primitive key
    if (
        process.env.NODE_ENV !== 'production' &&
        data.key && !isBaseType(data.key)
    ) {
        warn(
            'Avoid using non-primitive value as key, ' +
            'use string/number value instead.',
            context,
        );
    }

    let vnode: VNode | void;

    if (typeof tag === 'string') {
        if (isReservedTag(tag)) {
            vnode = new VNode(tag, data, ChildVNode, undefined, undefined, context);
        }
        else {
            const components = context.$options.components || {};
            const Ctor = components[camelize(tag)];

            if (Ctor) {
                vnode = createComponent(Ctor, data, context, ChildVNode, tag);
            }
            // unknown tag
            else {
                vnode = new VNode(tag, data, ChildVNode, undefined, undefined, context);
            }
        }

        // apply ns
        const ns = context.$vnode.ns || getTagNamespace(tag);

        if (ns && vnode) {
            applyNS(vnode, ns);
        }
    }
    else {
        vnode = createComponent(tag, data, context, ChildVNode);
    }

    return vnode ? vnode : createEmptyVNode();
}

function applyNS(vnode: VNode, ns: string, force = false) {
    // exclude space string
    if (ns) {
        vnode.ns = ns;
    }

    // use default namespace inside foreignObject
    if (vnode.tag === 'foreignObject') {
        ns = '';
        force = true;
    }

    for (const child of vnode.children) {
        if (
            child.tag &&
            (!child.ns || (force === true && child.tag !== 'svg'))
        ) {
            applyNS(child, ns, force);
        }
    }
}
