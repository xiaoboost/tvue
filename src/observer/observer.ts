import {
    def,
    isArray,
    isObject,
} from '../utils';

export interface ObservedObject {
    obProperty: Observer;
    [key: string]: any;
}

export interface Subscription {
    $forceUpdate(): void;
}

/** 全局观测器计数 */
let obCount = 0;
/** 被观测对象添加的观测器属性 */
const obProperty = Symbol('observer');

/** 观测器 */
export default class Observer {
    /** 当前观测器计数 */
    id = obCount++;
    /** 传入的原对象 */
    value: ObservedObject;
    /** 代理对象 */
    proxy: object;
    /** 当前观测器的订阅器 */
    subscriptions = new Set<Subscription>();

    static is(x: any): x is ObservedObject {
        return x.hasOwnProperty(obProperty) && x[obProperty] instanceof Observer;
    }

    /**
     * 将对象包装成观测器，该方法将会递归调用直到对象中所有属性都被包装完成
     *  - 不可枚举的属性不会被包装
     */
    static set<T extends object>(x: T): T {
        if (!isObject(x) || Observer.is(x)) {
            return x;
        }

        for (const value of Object.values(x)) {
            Observer.set(value);
        }

        return (new Observer(x).proxy as any);
    }

    constructor(value: object) {
        // 代理拦截器设置
        const proxyHandler: ProxyHandler<object> = {
            set: (...args) => this.set(...args),
        };

        if (isArray(value)) {
            proxyHandler.get = (...args) => {
                return this.getArrayProperties(...args);
            };
        }
        else if (isObject(value)) {
            proxyHandler.get = (...args) => {
                return this.getObjectProperties(...args);
            };
        }
        else {
            throw new Error('Observer must set in a Object');
        }

        def(value, obProperty, this);
        this.value = value as any;
        this.proxy = new Proxy(value, proxyHandler);
    }

    set(target: object, key: PropertyKey, value: any, receiver: any): boolean {
        let result: boolean;

        /**
         * 检查调用的原始对象是否当前代理本身
         * 如果当前对象在原型链上，由原型链上的某对象间接的调用了当前代理，则此时不能触发修改
         */
        if (receiver === this.proxy) {
            result = Reflect.set(target, key, value, receiver);
            Observer.set(value);
            this.broadcast();
        }
        else {
            result = Reflect.set(receiver, key, value);
        }

        return result;
    }

    getObjectProperties(target: object, key: PropertyKey, receiver: any) {
        if (observeSwitch) {
            targetStack.add(this.value);
        }

        return target[key];
    }

    getArrayProperties(target: object, key: PropertyKey, receiver: any) {
        /** 所有需要拦截的数组方法名称 */
        const methodsToIntercept = [
            'push', 'pop', 'shift', 'unshift',
            'splice', 'sort', 'reverse',
        ];

        if (observeSwitch) {
            targetStack.add(this.value);
        }

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

    /** 添加订阅器 */
    addSub(subscription: Subscription, deep = true) {
        this.subscriptions.add(subscription);

        if (!deep) {
            return;
        }
    }

    /** 触发订阅的更新 */
    broadcast() {
        for (const sub of this.subscriptions) {
            sub.$forceUpdate();
        }
    }
}

/** 观测收集器开关 */
let observeSwitch = false;
/** 观测器集合 */
const targetStack = new Set<object>();

/** 开始收集依赖 */
export function startCollect() {
    observeSwitch = true;
    targetStack.clear();
}

/** 停止收集依赖，并返回堆栈内的所有内容 */
export function stopCollect() {
    observeSwitch = false;
    return Array.from(targetStack);
}
