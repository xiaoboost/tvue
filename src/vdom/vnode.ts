import Component from '../instance';

type eventCb = (e: any) => any;
type nativeCb = (e: Event) => any;
type hookCb = (...args: any[]) => void;
type hookNames =
    'create' | 'init' | 'prepatch' | 'update' |
    'postpatch' | 'insert' | 'remove' | 'destroy';

export type VNodeChildren = Array<VNode | string>;

export interface VNodeComponentOptions {
    Ctor: typeof Component;
    propsData?: object;
    listeners?: object;
    children?: VNode[];
    tag?: string;
}

export interface VNodeData {
    key?: string | number;
    ref?: string;
    tag?: string;
    is?: string;
    refInFor?: boolean;
    model?: { value: any; callback(val: any): void };
    staticClass?: string;
    class?: string | string[] | { [className: string]: boolean };
    staticStyle?: CSSStyleDeclaration;
    style?: CSSStyleDeclaration[] | CSSStyleDeclaration;
    props?: { [key: string]: any };
    attrs?: { [key: string]: any };
    domProps?: { [key: string]: any };
    hook?: { [key in hookNames]?: hookCb[] };
    on?: { [key: string]: eventCb | eventCb[] };
    nativeOn?: { [key: string]: nativeCb | nativeCb[] };
    show?: boolean;
    directives?: VNodeDirective[];
}

export interface VNodeDirective {
    readonly name: string;
    readonly value: any;
    readonly oldValue: any;
    readonly expression: any;
    readonly arg: string;
    readonly modifiers: { [key: string]: boolean };
}

export default class VNode {
    tag: string;
    data: VNodeData;
    children: VNode[];
    text?: string;
    elm?: Element;
    context?: Component;
    key?: string | number;
    componentOptions?: VNodeComponentOptions;
    componentInstance?: Component;
    parent?: VNode;
    ns?: string;

    raw = false;
    isStatic = false;
    isComment = false;
    isCloned = false;
    isOnce = false;

    constructor(
        tag: string = '',
        data: VNodeData = {},
        children: VNode[] = [],
        text?: string,
        elm?: Element,
        context?: Component,
        componentOptions?: VNodeComponentOptions,
    ) {
        this.tag = tag;
        this.data = data;
        this.children = children;
        this.text = text;
        this.elm = elm;
        this.context = context;
        this.key = data && data.key;
        this.componentOptions = componentOptions;
    }

    mergeHook(name: hookNames, hook: (...args: any[]) => void) {
        if (!this.data.hook) {
            this.data.hook = {};
        }

        if (!this.data.hook[name]) {
            this.data.hook[name] = [];
        }

        (this.data.hook[name]!).push(hook);
    }

    callHook(name: hookNames, ...args: any[]) {
        if (this.data.hook && this.data.hook[name]) {
            const hooks = this.data.hook[name]!;

            for (const hook of hooks) {
                hook.apply(this, args);
            }

            // 钩子函数运行之后必须强制删除
            // 以确保它只被调用一次并防止内存泄漏
            this.data.hook[name] = [];
        }
    }
}

/**
 * 创建空节点
 * @param {string} text 文本
 */
export function createEmptyVNode(text = '') {
    const node = new VNode();
    node.text = text;
    node.isComment = true;
    return node;
}

/**
 * 创建文本节点
 * @param {string | number} val 文本
 */
export function createTextVNode(text: string | number) {
    return new VNode(undefined, undefined, undefined, String(text));
}

/**
 * 复制节点
 * @param {VNode} vnode 待复制的节点
 * @return {VNode}
 */
export function cloneVNode(vnode: VNode) {
    const cloned = new VNode(
        vnode.tag,
        vnode.data,
        vnode.children,
        vnode.text,
        vnode.elm,
        vnode.context,
        vnode.componentOptions,
    );

    cloned.ns = vnode.ns;
    cloned.key = vnode.key;
    cloned.isCloned = true;
    cloned.isStatic = vnode.isStatic;
    cloned.isComment = vnode.isComment;

    return cloned;
}
