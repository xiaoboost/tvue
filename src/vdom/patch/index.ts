import VNode from '../vnode';

import { sameVnode } from './helpers';
import { createElm } from './create-elem';
import { patchVnode } from './patch-vnode';
import { replaceElm } from './replace-elem';
import { invokeDestroyHook } from './hooks';

function patch(oldVnode?: VNode): void;
function patch(oldVnode: VNode, vnode: VNode, removeOnly?: boolean): Element;
function patch(oldVnode?: VNode, vnode?: VNode, removeOnly?: boolean) {
    if (!vnode) {
        if (oldVnode) {
            invokeDestroyHook(oldVnode);
        }
        return;
    }

    const insertedVnodeQueue: VNode[] = [];

    // empty mount (likely as component), create new root element
    if (!oldVnode) {
        createElm(vnode, insertedVnodeQueue);
    }
    // patch existing root node
    else if (sameVnode(oldVnode, vnode)) {
        patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly);
    }
    // replacing existing element
    else {
        replaceElm(oldVnode, vnode, insertedVnodeQueue);
    }

    for (const item of insertedVnodeQueue) {
        item.callHook('insert');
    }

    return vnode.elm;
}

export { patch };
