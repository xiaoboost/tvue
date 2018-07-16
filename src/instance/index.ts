import { stateMixin } from './state';
import { eventsMixin, eventCb } from './events';
import { Watcher, WatcherOption } from '../observer';

type WatcherCallback = string | ((newVal: any, oldVal: any) => void) | WatcherOption;

export default class Vuetc {
    // 组件属性
    $options!: ComponentOptions;
    $parent?: Vuetc;

    // 公共方法
    $set!: (target: any, key: string | number, val: any) => void;
    $delete!: (target: any, key: string | number) => void;
    $watch!: ( express: string, callback: WatcherCallback, option?: WatcherOption) => (() => void);
    $on!: (eventName: string | string[], fn: eventCb) => void;
    $once!: (eventName: string, fn: eventCb) => void;
    $off!: (eventName?: string | string[], fn?: eventCb) => void;
    $emit!: (eventName: string, ...args: any[]) => void;

    // 内部私有数据
    _events: { [eventName: string]: Array<(arg?: any) => any> } = {};
    _state: { [stateName: string]: any } = {};
    _props: { [propName: string]: any } = {};
    _watchers: Watcher[] = [];
    _watcher?: Watcher;

    // 内部私有状态
    _isVue = true;
    _isMounted = false;
    _isDestroyed = false;
    _isBeingDestroyed = false;
}

export interface ComponentOptions {
    name?: string;
    components?: { [componentName: string]: typeof Vuetc };
    props?: string[];
    state?: string[];
}

stateMixin(Vuetc);
eventsMixin(Vuetc);
