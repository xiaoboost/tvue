import Component from '../instance';

import VNode, { VNodeData } from './vnode';

export function createElement(
  context: Component,
  tag: string,
  data: VNodeData | Array<VNode | string>,
  children: Array<VNode | string> = [],
): VNode {
    // ..
}
