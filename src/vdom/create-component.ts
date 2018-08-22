import Component, { ComponentOptions } from '../instance';
import VNode, { VNodeData } from './vnode';

import {
    warn,
    hyphenate,
    hasOwn,
} from 'src/utils';

// inline hooks to be invoked on component VNodes during patch
const componentVNodeHooks = {
    init(this: VNode) {

    },
    prepatch(this: VNode, oldVnode: VNode) {

    },
    insert(this: VNode) {

    },
    destroy(this: VNode) {

    },
};

const hookKeys = Object.keys(componentVNodeHooks);

export function createComponent(
    Ctor: typeof Component,
    data: VNodeData,
    context: Component,
    children: VNode[] = [],
    tag?: string,
): VNode | void {
    // if at this stage it's not a constructor, reject.
    if (typeof Ctor !== 'function') {
        if (process.env.NODE_ENV !== 'production') {
            warn(`Invalid Component definition: ${String(Ctor)}`, context);
        }

        return;
    }

    // TODO: transform component v-model data into props & events

    // extract props
    const propsData = extraProps(data, Ctor);

    // extract listeners, since these needs to be treated as
    // child component listeners instead of DOM listeners
    const listeners = data.on;
    // replace with listeners with .native modifier
    // so it gets processed during parent component patch.
    data.on = data.nativeOn;

    // install component management hooks onto the placeholder node
    for (const key of hookKeys) {
        VNode.prototype.mergeHook.call({ data }, key, componentVNodeHooks[key]);
    }

    // return a placeholder vnode
    const name = Ctor.prototype.$options.name || tag;
    const vnode = new VNode(
        `vue-component-${name ? name : new Date().getTime()}`,
        data, undefined, undefined, undefined, context,
        { Ctor, propsData, listeners, tag, children },
    );

    return vnode;
}

function extraProps(data: VNodeData, Ctor: typeof Component) {
    const propOptions = Ctor.prototype.$options.props;

    if (!propOptions) {
        return;
    }

    const res: { [key: string]: string } = {};
    const hashs = [data.props || {}, data.attrs || {}];

    for (const key of propOptions) {
        const altKey = hyphenate(key);

        for (const hash of hashs) {
            if (hasOwn(hash, key)) {
                res[key] = hash[key];
                break;
            }
            else if (hasOwn(hash, altKey)) {
                res[key] = hash[altKey];
                break;
            }
        }
    }

    return res;
}
