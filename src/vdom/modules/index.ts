import VNode from '../vnode';

import attrs from './attrs';
import refs from './ref';

export interface HookFunc {
    create(oldVnode: VNode, vnode: VNode): void;
    activate(_: any, vnode: VNode): void;
    update(oldVnode: VNode, vnode: VNode): void;
    remove(Vnode: VNode, rm: () => void): void;
    destroy(Vnode: VNode): void;
}

export type HookFuncExport = Partial<HookFunc>;

export type FuncTypes = HookFunc[keyof HookFunc];

export type HooksFunc = {
    [P in keyof HookFunc]: Array<HookFunc[P]>;
};

export default {
    attrs,
    refs,
};
