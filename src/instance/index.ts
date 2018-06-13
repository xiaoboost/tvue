/* tslint:disable member-ordering */

import VNode, { VNodeData, VNodeChildData } from '../vdom/vnode';

import { eventsMixin } from './events';
import { renderMixin } from './render';
import { lifecycleMixin } from './lifecycle';

interface PropData {
    type: object | object[];
    default?: any | (() => object);
    required?: boolean;
    validator?(val: any): boolean;
}

export interface ComponentOptions {
    name?: string;
    components?: { [componentName: string]: typeof Vues };
    props?: { [key: string]: PropData };
    data?(): object;
    computed?: object;
    methods?: { [key: string]: (...args: any[]) => any };
}

export interface PluginObject {
    install(Vue: typeof Vues): void;
    [key: string]: any;
}

export type CreateElement = Vues['$createElement'];

export default class Vues {
    /** 组件选项 */
    static options: ComponentOptions;
    /** Vues 扩展安装 */
    static use(plugin: PluginObject) {
        plugin.install(Vues);
    }

    /** 组件 DOM 元素 */
    $el!: Element;
    /** 当前组件的父元素 */
    $parent?: Vues;
    /** 当前组件的子元素 */
    $children: Vues[] = [];
    /** 组件对应的虚拟 DOM */
    $vnode!: VNode;
    /** 当前元素的引用元素 */
    $refs: { [componentName: string]: Element | Element[] | Vues | Vues[] } = {};
    /** 组件选项 */
    $options!: ComponentOptions;

    /** 渲染函数声明 */
    render!: (h: CreateElement) => VNode;

    // 生命周期
    /** 将 DOM 元素插入页面之前 */
    beforeMount!: () => void;
    /** 将 DOM 元素插入页面之后 */
    mounted!: () => void;
    /** 销毁当前元素之前 */
    beforeDestroy!: () => void;
    /** 销毁当前元素之后 */
    destroyed!: () => void;
    /** 当前组件元素 DOM 更新之前 */
    beforeUpdate!: () => void;

    // 事件部分声明
    /** 绑定事件 */
    $on!: (eventName: string | string[], fn: (arg?: any) => any) => void;
    /** 绑定单次事件 */
    $once!: (eventName: string, fn: (arg?: any) => any) => void;
    /** 解除事件绑定 */
    $off!: (eventName?: string | string[], fn?: (arg?: any) => any) => void;
    /** 触发事件 */
    $emit!: (eventName: string, args: any) => void;

    // 生命周期部分声明
    /** 创建并挂载 DOM */
    $mount!: (el: string | Element) => void;
    /** 更新当前组件 */
    $forceUpdate!: () => void;
    /** 销毁组件 */
    $destroy!: () => void;

    // DOM 渲染部分声明
    /** 计算生成当前虚拟 DOM 树 */
    _render!: () => VNode;
    /**  */
    _update!: (vn: VNode) => void;
    /** 在下次 DOM 更新循环结束之后执行延迟回调 */
    $nextTick!: (fn?: () => any) => Promise<void>;
    /** 以当前组件为上下文渲染虚拟节点 */
    $createElement!: (tag: string, data: VNodeData | VNodeChildData, children?: VNodeChildData) => VNode;

    // 内部私有数据
    /** 事件数据 */
    _events: { [eventName: string]: Array<(arg?: any) => any> } = {};
    /** 状态数据 */
    _state: { [stateName: string]: any } = {};
    /** 属性数据 */
    _props: { [propName: string]: any } = {};
    /** 监控数据 */
    _watcher: { [watcherName: string]: any } = {};

    constructor(options?: ComponentOptions) {

    }
}

eventsMixin(Vues);
renderMixin(Vues);
lifecycleMixin(Vues);
