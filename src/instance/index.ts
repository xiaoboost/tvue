import { stateMixin } from './state';
import { Watcher, WatcherOption } from '../observer';

export default class Vuetc {
    // 组件属性
    $options!: ComponentOptions;
    $parent!: Vuetc;

    // 公共方法
    $set!: (target: any, key: string | number, val: any) => void;
    $delete!: (target: any, key: string | number) => void;
    $watch!: (
        express: string,
        callback: string | ((newVal: any, oldVal: any) => void) | WatcherOption,
        option?: WatcherOption,
    ) => (() => void);

    // 内部私有数据
    _state: { [stateName: string]: any } = {};
    _props: { [propName: string]: any } = {};
    _watchers: Watcher[] = [];
    _watcher?: Watcher;

    // 内部私有状态量定义
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
