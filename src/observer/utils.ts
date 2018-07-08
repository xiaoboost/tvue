import Dep from './dep';
import VNode from '../vdom';

import Observer, {
    isObservedObject,
    ObservedObject,
} from './observer';

import {
    isObject,
    isArray,
    isBaseType,
    isStrictObject,
    isValidArrayIndex,
    hasOwn,
} from 'src/utils';

/**
 * 尝试为值创建观察者实例
 *  - 如果成功观察则返回新观察者
 *  - 如果值已经有，则返回现有观察者
 */
export function observe(value: object, asRootData?: boolean): Observer | void {
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
 * 在对象中定义一个响应式属性
 */
export function defineReactive(
    obj: object,
    key: string,
    val?: any,
    customSetter?: () => any,
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

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: function reactiveGetter() {
            return getter ? getter.call(obj) : val;
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

            dep.notify();
        },
    });
}

/**
 * 在对象中设置属性值
 * 如果该属性不存在，那么触发改变
 */
export function set(target: any, key: string | number, val: any): any {
    if (process.env.NODE_ENV !== 'production' && isBaseType(target)) {
        throw new Error(`Cannot set reactive property on undefined, null, or primitive value: ${String(target)}`);
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
 * 删除对象的属性，必要的话触发改变
 */
export function del(target: any, key: string | number) {
    if (process.env.NODE_ENV !== 'production' && isBaseType(target)) {
        throw new Error(`Cannot set reactive property on undefined, null, or primitive value: ${String(target)}`);
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
