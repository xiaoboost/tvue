import Dep from './dep';
import VNode from '../vdom';
import Component from '../instance';
import { queueWatcher } from './scheduler';

import {
    warn,
    remove,
    isFunc,
    isObject,
    isArray,
    isBaseType,
    parsePath,
    handleError,
} from '../utils';

// 全局观测器代号
let uid = 0;
// 全局观测器代号集合
const seen = new Set<number>();

export type WatcherCb = (newVal: any, oldVal: any) => void;

export interface WatcherOption {
    deep?: boolean;
    immediate?: boolean;
    handler?: WatcherCb;
}

interface WatcherConOption {
    deep: boolean;
    computed: boolean;
    user: boolean;
    sync: boolean;
    before?: () => any;
}

/**
 * 递归遍历对象，激活所有取值器
 * 所以在对象内部的嵌套属性都会被收集，成为“深度 (deep)”的依赖
 */
export function traverse(val: any) {
    if (
        isBaseType(val) ||
        Object.isFrozen(val) ||
        val instanceof VNode ||
        val instanceof Node
    ) {
        return;
    }

    if (val.__ob__) {
        const depId = val.__ob__.dep.id;
        if (seen.has(depId)) {
            return;
        }

        seen.add(depId);
    }

    if (isArray(val)) {
        val.forEach(traverse);
    }
    else {
        Object.values(val).forEach(traverse);
    }
}

export default class Watcher implements WatcherConOption {
    vm: Component;
    id: number;
    cb: WatcherCb;
    active: boolean;
    dirty: boolean;
    deep: boolean;
    user: boolean;
    computed: boolean;
    sync: boolean;
    deps: Dep[];
    newDeps: Dep[];
    depIds: Set<number>;
    newDepIds: Set<number>;
    expression: string;

    before?: () => any;
    getter: WatcherCb;

    dep?: Dep;
    value: any;

    constructor(
        vm: Component,
        expOrFn: string | WatcherCb,
        cb: WatcherCb,
        options?: Partial<WatcherConOption>,
        isRenderWatcher?: boolean,
    ) {
        if (isRenderWatcher) {
            vm._watcher = this;
        }

        this.vm = vm;
        vm._watchers.push(this);

        // options
        if (options) {
            this.deep = !!options.deep;
            this.user = !!options.user;
            this.computed = !!options.computed;
            this.sync = !!options.sync;
            this.before = options.before;
        }
        else {
            this.deep = this.user = this.computed = this.sync = false;
        }

        this.cb = cb;
        this.id = ++uid;
        this.active = true;
        this.dirty = this.computed;
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();
        this.expression = (
            process.env.NODE_ENV !== 'production'
                ? expOrFn.toString()
                : ''
        );

        // parse expression for getter
        if (isFunc(expOrFn)) {
            this.getter = expOrFn;
        }
        else {
            this.getter = parsePath(expOrFn);

            if (!this.getter) {
                this.getter = () => { return; };

                if (process.env.NODE_ENV !== 'production') {
                    warn(
                        `Failed watching path: "${expOrFn}" ` +
                        'Watcher only accepts simple dot-delimited paths. ' +
                        'For full control, use a function instead.',
                        vm,
                    );
                }
            }
        }

        if (this.computed) {
            this.value = undefined;
            this.dep = new Dep();
        }
        else {
            this.value = this.get();
        }
    }

    /**
     * Evaluate the getter, and re-collect dependencies.
     */
    get() {
        let value;
        const vm = this.vm;

        try {
            value = this.getter.call(vm, vm);
        }
        catch (e) {
            if (this.user) {
                handleError(e, vm, `getter for watcher "${this.expression}"`);
            }
            else {
                throw e;
            }
        }
        finally {
            if (this.deep) {
                traverse(value);
            }

            this.cleanupDeps();
        }

        return value;
    }

    /**
     * 为当前观测器添加依赖
     */
    addDep(dep: Dep) {
        const id = dep.id;
        if (!this.newDepIds.has(id)) {
            this.newDepIds.add(id);
            this.newDeps.push(dep);
            if (!this.depIds.has(id)) {
                dep.addSub(this);
            }
        }
    }

    /**
     * 清空所有依赖
     */
    cleanupDeps() {
        let i = this.deps.length, temp: any;

        while (i--) {
            const dep = this.deps[i];
            if (!this.newDepIds.has(dep.id)) {
                dep.removeSub(this);
            }
        }

        temp = this.depIds;
        this.depIds = this.newDepIds;
        this.newDepIds = temp;
        this.newDepIds.clear();

        temp = this.deps;
        this.deps = this.newDeps;
        this.newDeps = temp;
        this.newDeps.length = 0;
    }

    /**
     * 订阅者（Scheduler）接口
     * 该方法会在依赖改变的时候被调用
     */
    update() {
        if (this.computed && this.dep) {
            const dep = this.dep;
            /**
             * 计算属性观测器有两种模式：被动模式（lazy）、主动模式（activated）。
             * 默认情况下它将会初始化为被动模式，并且仅在至少有一个订阅者依赖时才会被激活
             * 该订阅者通常是另一个计算属性或组件的渲染函数。
             */
            if (dep.subs.length === 0) {
                /**
                 * 在被动模式下，我们不希望在不必要时执行计算
                 * 因此我们将 Watcher.dirty 置高，当访问计算属性时，
                 * 我们将会实时的调用 this.evaluate() 来计算当前的值。
                 */
                this.dirty = true;
            }
            else {
                /**
                 * 在主动模式下，我们希望主动执行计算
                 * 但仅在被监控的值确实发生了变化时，才通知当前观测器的订阅者。
                 */
                this.getAndInvoke(() => dep.notify());
            }
        }
        else if (this.sync) {
            this.run();
        }
        else {
            queueWatcher(this);
        }
    }

    /**
     * 观测器调用函数
     */
    run() {
        if (this.active) {
            this.getAndInvoke(this.cb);
        }
    }

    getAndInvoke(cb: WatcherCb) {
        const value = this.get();
        if (
            value !== this.value ||
            /**
             * 对于对象和数组上的深度观测器和观测器，
             * 它们即使在值相同时也应该触发，
             * 因为该值可能已经发生变异
             */
            isObject(value) ||
            this.deep
        ) {
            // set new value
            const oldValue = this.value;
            this.value = value;
            this.dirty = false;

            cb.call(this.vm, value, oldValue);
        }
    }

    /**
     * 评估然后返回当前监控的值
     * 当前方法只会被计算属性观测器调用
     */
    evaluate() {
        if (this.dirty) {
            this.value = this.get();
            this.dirty = false;
        }
        return this.value;
    }

    /**
     * 将当前观测器从所有依赖的订阅器列表中移除
     */
    teardown() {
        if (this.active) {
            // remove self from vm's watcher list
            // this is a somewhat expensive operation so we skip it
            // if the vm is being destroyed.
            if (!this.vm._isBeingDestroyed) {
                remove(this.vm._watchers, this);
            }

            this.deps.forEach((dep) => dep.removeSub(this));
            this.active = false;
        }
    }
}
