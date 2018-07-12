import Dep from './dep';
import { hasOwn } from '../utils';

export interface ObservedObject {
    __ob__: Observer;
    _isVue: boolean;
    [key: string]: any;
}

/**
 * 判断当前对象是否已经完成绑定数据的初始化
 * @param x {any}
 */
export function isObservedObject(x: any): x is ObservedObject {
    return hasOwn(x, '__ob__') && x.__ob__ instanceof Observer;
}

export default class Observer {
    value: any;
    dep = new Dep();
    vmCount = 0; // number of vms that has this object as root $data

    constructor(value: any) {
        this.value = value;
    }

    walk(obj: object) {
        // ..
    }

    observeArray(items: any[]) {
        // ..
    }
}
