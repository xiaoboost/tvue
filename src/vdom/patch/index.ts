import VNode from '../vnode';

function patch(oldVnode?: VNode): void;
function patch(oldVnode: VNode | Element, vnode: VNode, removeOnly?: boolean): Element;
function patch(oldVnode?: VNode | Element, vnode?: VNode, removeOnly?: boolean) {
    // ..
}

export { patch };
