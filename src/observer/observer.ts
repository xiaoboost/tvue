import {
    hasOwn,
    isArray,
    isObject,
    handleError,
} from '../utils';

export interface ObservedObject {
    __ob__: Observer;
    [key: string]: any;
}

/** 全局观测器计数 */
let obCount = 0;

/** 观测器 */
export default class Observer {
    /** 当前观测器计数 */
    id = obCount++;
    /** 传入的原对象 */
    value: ObservedObject;
    /** 代理对象 */
    proxy: object;
    /** 当前观测器的订阅器 */
    subscriptions = [];

    static isObserver(x: any): x is ObservedObject {
        return hasOwn(x, '__ob__') && x.__ob__ instanceof Observer;
    }

    constructor(value: object) {
        // 代理拦截器设置
        const proxyHandler: ProxyHandler<object> = {
            set: (...args) => this.set(...args),
        };

        if (isArray(value)) {
            proxyHandler.get = (...args) => {
                this.getArrayMethods(...args);
            };
        }
        else if (!isObject(value)) {
            handleError(new Error('Must be a Object'));
        }

        this.value = value as any;
        this.value.__ob__ = this;
        this.proxy = new Proxy(value, proxyHandler);
    }

    set(target: object, key: PropertyKey, value: any, receiver: any): boolean {
        let result: boolean;

        /**
         * 检查调用的原始对象是否当前代理本身
         * 如果当前对象在原型链上，由原型链上的某对象间接的调用了当前代理，则此时不能触发修改
         */
        if (receiver === this.proxy) {
            // TODO: 新加入的对象也需要递归调用观测器

            result = Reflect.set(target, key, value, receiver);
            this.broadcast();
        }
        else {
            result = Reflect.set(receiver, key, value);
        }

        return result;
    }

    getArrayMethods(target: object, key: PropertyKey, receiver: any) {
        /** 所有需要拦截的数组方法名称 */
        const methodsToIntercept = [
            'push', 'pop', 'shift', 'unshift',
            'splice', 'sort', 'reverse',
        ];

        // 拦截属性
        if (methodsToIntercept.includes(key as string)) {
            return (...args: any[]) => {
                target[key](...args);
                this.broadcast();
            };
        }
        else {
            return target[key];
        }
    }

    broadcast() {

    }
}
