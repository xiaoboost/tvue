import Dep from './dep';
import VNode from 'src/vdom';
import Watcher from './watcher';
import { ArrayPrototype } from './array';

import {
    def,
    hasOwn,
    isObject,
    isArray,
    isBaseType,
    isStrictObject,
    isValidArrayIndex,
} from 'src/utils';

export { Dep, Watcher };

export interface ObservedObject {
    __ob__: Observer;
    _isVue: boolean;
    [key: string]: any;
}

/**
 * 判断当前对象是否已经完成绑定数据的初始化
 * @param x {any}
 */
function isObservedObject(x: any): x is ObservedObject {
    return hasOwn(x, '__ob__') && x.__ob__ instanceof Observer;
}

/**
 * 对所有数组实例重写数组方法
 *  - 包含数组的实例本身以及继承自数组的类的实例
 * @param value {any[]}
 */
function replaceArrayPrototype(value: any[]) {
    const origin = Array.prototype;

    let ob = value;
    while (Object.getPrototypeOf(ob) !== origin) {
        ob = Object.getPrototypeOf(ob);
    }

    Object.setPrototypeOf(ob, ArrayPrototype);
}

export class Observer {
    value: any;
    dep: Dep;
    vmCount: number; // number of vms that has this object as root $data

    constructor(value: any) {
        this.value = value;
        this.dep = new Dep();
        this.vmCount = 0;

        def(value, '__ob__', this);

        // 如果是继承自
        if (isArray(value)) {
            replaceArrayPrototype(value);
            this.observeArray(value);
        }
        else {
            this.walk(value);
        }
    }

    /**
     * Walk through each property and convert them into
     * getter/setters. This method should only be called when
     * value type is Object.
     */
    walk(obj: object) {
        Object.keys(obj).forEach((key) => defineReactive(obj, key));
    }

    /**
     * Observe a list of Array items.
     */
    observeArray(items: any[]) {
        items.forEach((item, i) => observe(item));
    }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe(value: ObservedObject | object, asRootData?: boolean): Observer | void {
    if (!isObject(value) || value instanceof VNode) {
        return;
    }

    let ob: Observer | void;
    if (isObservedObject(value)) {
        ob = value.__ob__;
    }
    else if (
      (isArray(value) || isStrictObject(value)) &&
      Object.isExtensible(value) &&
      !value._isVue
    ) {
        ob = new Observer(value);
    }

    if (asRootData && ob) {
        ob.vmCount++;
    }
    return ob;
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive(
    obj: object,
    key: string,
    val: any,
    customSetter?: ?Function,
    shallow?: boolean,
) {
    const dep = new Dep();
    const property = Object.getOwnPropertyDescriptor(obj, key);

    if (property && property.configurable === false) {
        return;
    }

    // cater for pre-defined getter/setters
    const getter = property && property.get;
    const setter = property && property.set;
    if ((!getter || setter) && arguments.length === 2) {
        val = obj[key];
    }

    let childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            const value = getter ? getter.call(obj) : val;
            if (Dep.target) {
                dep.depend();
                if (childOb) {
                    childOb.dep.depend();
                    if (Array.isArray(value)) {
                        dependArray(value);
                    }
                }
            }
            return value;
        },
        set: function reactiveSetter(newVal) {
            const value = getter ? getter.call(obj) : val;

            if (newVal === value || (newVal !== newVal && value !== value)) {
                return;
            }

            if (process.env.NODE_ENV !== 'production' && customSetter) {
                customSetter();
            }

            if (setter) {
                setter.call(obj, newVal);
            }
            else {
                val = newVal;
            }
            childOb = !shallow && observe(newVal);
            dep.notify();
        },
    });
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set(target: any[] | object, key: string | number, val: any): any {
    if (process.env.NODE_ENV !== 'production' && isBaseType(target)) {
        throw new Error(`Cannot set reactive property on undefined, null, or primitive value: ${target.toString()}`);
    }

    if (isArray(target) && isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key);
        target.splice(key, 1, val);
        return val;
    }

    if (key in target && !(key in Object.prototype)) {
        target[key] = val;
        return val;
    }

    const _target = target as ObservedObject;
    const ob = _target.__ob__;

    if (_target._isVue || (ob && ob.vmCount)) {
        if (process.env.NODE_ENV !== 'production') {
            throw new Error(
                'Avoid adding reactive properties to a Vue instance' +
                ' or its root $data at runtime',
            );
        }
        return val;
    }

    if (!ob) {
        target[key] = val;
        return val;
    }

    defineReactive(ob.value, String(key), val);
    ob.dep.notify();
    return val;
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del(target: any[] | object, key: any) {
    if (process.env.NODE_ENV !== 'production' && isBaseType(target)) {
        throw new Error(`Cannot set reactive property on undefined, null, or primitive value: ${target.toString()}`);
    }

    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.splice(key, 1);
        return;
    }

    const _target = target as ObservedObject;
    const ob = _target.__ob__;

    if (_target._isVue || (ob && ob.vmCount)) {
        if (process.env.NODE_ENV !== 'production') {
            throw new Error(
                'Avoid deleting properties on a Vue instance or its root $data ' +
                '- just set it to null.',
            );
        }
        return;
    }

    if (!hasOwn(target, key)) {
        return;
    }

    delete target[key];

    if (!ob) {
        return;
    }

    ob.dep.notify();
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray(value: any[]) {
    for (let i = 0, l = value.length; i < l; i++) {
        const item = value[i];

        if (isObservedObject(item)) {
            item.__ob__.dep.depend();
        }

        if (isArray(item)) {
            dependArray(item);
        }
    }
}
