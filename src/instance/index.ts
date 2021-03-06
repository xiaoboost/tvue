import VNode, { VNodeData, VNodeChildren } from '../vdom';

import { stateMixin } from './state';
import { renderMixin } from './render';
import { eventsMixin, eventCb } from './events';
import { lifecycleMixin, LifecycleKeys } from './lifecycle';

import { nextTick } from '../utils';
import { patch } from '../vdom/patch';
import { Watcher, Observer, WatcherOption } from '../observer';

type CreateElement = Vuetc['$createElement'];
type WatcherCallback = string | ((newVal: any, oldVal: any) => void) | WatcherOption;

export default class Vuetc {
    // 组件属性
    $options!: ComponentOptions;
    $parent?: Vuetc;
    $el!: Element;
    $vnode!: VNode;
    $children: Vuetc[] = [];
    $refs!: Element | Element[] | Vuetc | Vuetc[];

    // 公共方法
    $set!: (key: string | number, val: any) => void;
    $delete!: (key: string | number) => void;
    $watch!: (express: string, callback: WatcherCallback, option?: WatcherOption) => (() => void);
    $on!: (eventName: string | string[], fn: eventCb) => void;
    $once!: (eventName: string, fn: eventCb) => void;
    $off!: (eventName?: string | string[], fn?: eventCb) => void;
    $emit!: (eventName: string, ...args: any[]) => void;
    $forceUpdate!: () => void;
    $destroy!: () => void;
    $mount!: (el?: string | Element) => this;
    $createElement!: (tag: string, data?: VNodeData | VNodeChildren, children?: VNodeChildren) => VNode;

    // 内部私有数据
    _events: { [eventName: string]: Array<(arg?: any) => any> } = {};
    _state: { [stateName: string]: any } = {};
    _props: { [propName: string]: any } = {};
    _watchers: Watcher[] = [];
    _observers: Observer[] = [];

    // 私有方法
    _render!: () => VNode;
    _patch!: typeof patch;
    _callHook!: (name: LifecycleKeys) => void;
    _update!: (vnode: VNode, hydrating?: boolean) => void;

    // 内部私有状态
    _isVue = true;
    _isMounted = false;
    _isDestroyed = false;
    _isBeingDestroyed = false;

    // 渲染函数
    render!: (h: CreateElement) => VNode;

    $nextTick(): Promise<this>;
    $nextTick(fn: Function): void;
    $nextTick(fn?: Function): void | Promise<this> {
        return nextTick(fn, this);
    }
}

export type ComponentOptions = {
    name?: string;
    components?: { [componentName: string]: typeof Vuetc };
    props?: string[];
    state?: string[];
} & {
    [key in LifecycleKeys]?: (() => void)[];
};

stateMixin(Vuetc);
eventsMixin(Vuetc);
renderMixin(Vuetc);
lifecycleMixin(Vuetc);
