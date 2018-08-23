import VNode from '../vnode';
import dom, { HooksFunc, FuncTypes } from '../modules';

const emptyNode = new VNode('', {}, []);
const hookKeys: Array<keyof HooksFunc> = ['create', 'activate', 'update', 'remove', 'destroy'];

export const eleHooks: HooksFunc = {} as any;

// 集合所有钩子
hookKeys.forEach((key) => {
    const hook: FuncTypes[] = eleHooks[key] = [];

    Object.values(dom).forEach((module) => {
        const fn = module[key];
        fn && hook.push(fn);
    });
});

export function invokeCreateHooks(vnode: VNode, queue: VNode[]) {
    vnode.callHook('create');
    eleHooks.create.forEach((f) => f(emptyNode, vnode));

    if (vnode.data.hook && vnode.data.hook.insert) {
        queue.push(vnode);
    }
}

/** 调用更新钩子函数 */
export function invokeUpdateHooks(oldVnode: VNode, vnode: VNode) {
    eleHooks.update.forEach((f) => f(emptyNode, vnode));
    oldVnode.callHook('update', vnode);
}

/** 调用销毁钩子函数 */
export function invokeDestroyHook(vnode: VNode) {
    // 调用当前钩子函数
    vnode.callHook('destroy');
    eleHooks.destroy.forEach((f) => f(vnode));
    // 调用子节点的钩子函数
    vnode.children.forEach(invokeDestroyHook);
}
