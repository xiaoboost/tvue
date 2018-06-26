import Dep, { popTarget, pushTarget } from './dep';
import VNode from '../vdom';
import Component from 'src/instance';
import { queueWatcher } from './scheduler';

import {
    isFunc,
    isObject,
    isArray,
    isBaseType,
    remove,
    parsePath,
} from 'src/utils';

// 全局监控器代号
let uid = 0;
// 全局监控器代号集合
const seen = new Set<number>();

export type WatcherCb = () => any;

export interface WatchOption {
    deep?: boolean;
    computed?: boolean;
    sync?: boolean;
    before?: boolean;
}

/**
 * 递归遍历对象，激活所有取值器
 * 所以在对象内部的嵌套属性都会被收集，成为“深度 (deep)”的依赖
 */
export function traverse(val: any) {
    const isA = isArray(val);

    if (
        isBaseType(val) ||
        Object.isFrozen(val) ||
        val instanceof VNode
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

export default class Watcher implements Required<WatchOption> {
    vm: Component;
    id: number;
    cb: WatcherCb;
    active: boolean;
    dirty: boolean;
    deep: boolean;
    computed: boolean;
    sync: boolean;
    before: boolean;
    deps: Dep[];
    newDeps: Dep[];
    depIds: Set<number>;
    newDepIds: Set<number>;
    getter: () => any;

    dep?: Dep;
    value: any;

    constructor(
        vm: Component,
        expOrFn: string | WatcherCb,
        cb: WatcherCb,
        options?: WatchOption,
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
            this.computed = !!options.computed;
            this.sync = !!options.sync;
            this.before = !!options.before;
        }
        else {
            this.deep = this.computed = this.sync = this.before = false;
        }

        this.cb = cb;
        this.id = ++uid;
        this.active = true;
        this.dirty = this.computed; // for computed watchers
        this.deps = [];
        this.newDeps = [];
        this.depIds = new Set();
        this.newDepIds = new Set();

        // parse expression for getter
        if (isFunc(expOrFn)) {
            this.getter = expOrFn;
        }
        else {
            this.getter = parsePath(expOrFn);

            if (process.env.NODE_ENV !== 'production' && !this.getter) {
                throw new Error(
                    `Failed watching path: "${expOrFn}" ` +
                    'Watcher only accepts simple dot-delimited paths. ' +
                    'For full control, use a function instead.',
                );
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
        pushTarget(this);
        let value;
        const vm = this.vm;

        try {
            value = this.getter.call(vm, vm);
        }
        catch (e) {
            throw e;
        }
        finally {
            // "touch" every property so they are all tracked as
            // dependencies for deep watching
            if (this.deep) {
                traverse(value);
            }

            popTarget();
            this.cleanupDeps();
        }

        return value;
    }

    /**
     * Add a dependency to this directive.
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
     * Clean up for dependency collection.
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
     * Subscriber interface.
     * Will be called when a dependency changes.
     */
    update() {
        if (this.computed && this.dep) {
            const dep = this.dep;
            // A computed property watcher has two modes: lazy and activated.
            // It initializes as lazy by default, and only becomes activated when
            // it is depended on by at least one subscriber, which is typically
            // another computed property or a component's render function.
            if (dep.subs.length === 0) {
                // In lazy mode, we don't want to perform computations until necessary,
                // so we simply mark the watcher as dirty. The actual computation is
                // performed just-in-time in this.evaluate() when the computed property
                // is accessed.
                this.dirty = true;
            }
            else {
                // In activated mode, we want to proactively perform the computation
                // but only notify our subscribers when the value has indeed changed.
                this.getAndInvoke(() => {
                    dep.notify();
                });
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
     * Scheduler job interface.
     * Will be called by the scheduler.
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
            // Deep watchers and watchers on Object/Arrays should fire even
            // when the value is the same, because the value may
            // have mutated.
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
     * Evaluate and return the value of the watcher.
     * This only gets called for computed property watchers.
     */
    evaluate() {
        if (this.dirty) {
            this.value = this.get();
            this.dirty = false;
        }
        return this.value;
    }

    /**
     * Depend on this watcher. Only for computed property watchers.
     */
    depend() {
        if (this.dep && Dep.target) {
            this.dep.depend();
        }
    }

    /**
     * Remove self from all dependencies' subscriber list.
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
